DHF on DHS
==========

This project is a bare-bones way to ensure that you have a valid Data Hub Services
installation.  I assume you have gone through all of the instructions for DHS and
have:

1. Set up an amazon VPC, along with a "bastion host" within that VPC to run things on.
1. Created a MarkLogic Service Account
1. Createed a peering role so that your VPC can access the MarkLogic DHS VPC
1. Created and configured the networking for HF
1. Created the Data Hub Services itself
1. Created a routing table thingy
1. Created a user in the Data Hub Service -- give this user "flow Operator" AND "flow developer" roles.
1. Go 'view' your service.  RIght click on the "flows" and copy the link behind it.  Paste that value into somewhere.  Then just get the host name out of that URL and use it in the command lines below.

WOW

OK so now you have a bastion host in your "customer VPC" and a Data Hub Service who can speak to each other.


Now check that you can log onto the bastion host.

```ssh -i ./path/to/my/private-key.pem ec2user@ec2-54-212-40-191.us-west-2.compute.amazonaws.com```


Once you're there, this project can take over.

1. If this is the first time on your bastion host, install git `sudo yum install git`
1. If this is the first time on your bastion host, install java `sudo yum install java`
1. Now clone this project `git clone https://github.com/marklogic/dhs-dhf-sample
1. Edit the following properies in `gradle.properties`
mlHost=   the value from up there
mlUsername  set to the user you made above
mlPassword set to the password from the user above
mlManageUsername  set to the user you made above
mlManagePassword  set to the password from the user above
1. Install hub modules  and user code `./gradlew mlLoadModules`
1. Load a file from the test-data folder
```
curl -X PUT \
 -H content-type:application/json \
 -d@test-data/person1.json \
 --digest \
 --user username:password \
 "http://{$HOST}:8006/v1/documents?uri=person1.json&collection=Person"
 ```
1. Check it
```
curl --digest \
 --user username:password \
 "http://{$HOST}:8006/v1/documents?uri=person1.json"
```
1. Run a harmonize flow
```
./gradlew hubRunFlow -PentityName=Person -PflowName=PersonHarmonize
```
1. Read the harmonized document from FINAL
```
curl --digest \
 --user username:password \
 "http://{$HOST}:8006/v1/documents?uri=person1.json&database=data-hub-FINAL"
```





