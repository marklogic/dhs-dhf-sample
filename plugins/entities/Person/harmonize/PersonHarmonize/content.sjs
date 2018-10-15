'use strict'

/*
* Create Content Plugin
*
* @param id         - the identifier returned by the collector
* @param options    - an object containing options. Options are sent from Java
*
* @return - your content
*/
function createContent(id, options) {
  let doc = cts.doc(id);

  let source;

  // for xml we need to use xpath
  if(doc && xdmp.nodeKind(doc) === 'element' && doc instanceof XMLDocument) {
    source = doc
  }
  // for json we need to return the instance
  else if(doc && doc instanceof Document) {
    source = fn.head(doc.root);
  }
  // for everything else
  else {
    source = doc;
  }

  return extractInstancePerson(source);
}
  
/**
* Creates an object instance from some source document.
* @param source  A document or node that contains
*   data for populating a Person
* @return An object with extracted data and
*   metadata about the instance.
*/
function extractInstancePerson(source) {
  // the original source documents
  let attachments = source;
  // now check to see if we have XML or json, then create a node clone from the root of the instance
  if (source instanceof Element || source instanceof ObjectNode) {
    let instancePath = '/*:envelope/*:instance';
    if(source instanceof Element) {
      //make sure we grab content root only
      instancePath += '/node()[not(. instance of processing-instruction() or . instance of comment())]';
    }
    source = new NodeBuilder().addNode(fn.head(source.xpath(instancePath))).toNode();
  }
  else{
    source = new NodeBuilder().addNode(fn.head(source)).toNode();
  }
  let id = !fn.empty(fn.head(source.xpath('/id'))) ? xs.string(fn.head(fn.head(source.xpath('/id')))) : null;
  let firstName = !fn.empty(fn.head(source.xpath('/firstName'))) ? xs.string(fn.head(fn.head(source.xpath('/firstName')))) : null;
  let lastName = !fn.empty(fn.head(source.xpath('/lastName'))) ? xs.string(fn.head(fn.head(source.xpath('/lastName')))) : null;
  let fullName = !fn.empty(fn.head(source.xpath('/fullName'))) ? xs.string(fn.head(fn.head(source.xpath('/fullName')))) : null;
  let address = !fn.empty(fn.head(source.xpath('/address'))) ? xs.string(fn.head(fn.head(source.xpath('/address')))) : null;
  
  /* The following property is a local reference. */
  let friendOf = null;
  if(fn.head(source.xpath('/friendOf'))) {
    // let's create and pass the node
    let friendOfSource = new NodeBuilder();
    friendOfSource.addNode(fn.head(source.xpath('/friendOf'))).toNode();
    // either return an instance of a Person
    friendOf = extractInstancePerson(friendOfSource);
  
    // or a reference to a Person
    // friendOf = makeReferenceObject('Person', friendOfSource));
  };

  // return the instance object
  return {
    '$attachments': attachments,
    '$type': 'Person',
    '$version': '0.0.2',
    'id': id,
    'firstName': firstName,
    'lastName': lastName,
    'fullName': fullName,
    'address': address,
    'friendOf': friendOf
  }
};


function makeReferenceObject(type, ref) {
  return {
    '$type': type,
    '$ref': ref
  };
}

module.exports = {
  createContent: createContent
};

