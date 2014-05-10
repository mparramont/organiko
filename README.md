# Organiko website
Repository for Organiko website.

Built with:
* Middleman

## Setup
* Clone repo
* Run `bundle`

## Run in development
* Run `middleman`

## Setup deploy to staging (Google Drive)
* Download and setup Google Drive app
* `mkdir ~/Google\ Drive/organiko` if not there
* Run `.deploy.sh`
* Go to Google drive on the web, share the `organiko` folder to the public, grab hash from the share link, and access the page like this: https://googledrive.com/host/[hash]/es/


## Deploy to staging
* Run `./deploy-staging.sh`
* Go to the access link generated on the deploy setup. Current is  [this one](https://googledrive.com/host/0B7tLcr4CYsvTcnR0ZjlXMVp2T28/es/).

## Deploy to live manually:
* Go to [Amazon S3 Management Console](https://console.aws.amazon.com/s3/home)
* Upload files manually (boooring)

## Deploy to live automatically:
TODO
