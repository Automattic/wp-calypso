# Experimental Docker based development environment

An experimental Docker based development environment was recently added to the `wp-calypso` environment. It employs the [`Dockerfile.development`](../../Dockerfile.development) file alongside the [`docker-compose.development.yml`](../docker-compose.development.yml) file to spin up a Calypso build in a docker container with the files mapped to your repositories file system. This means that Calypso itself is running in the Docker container while you can still edit files on your normal file-system without having to connect your editor to the Docker environment.

## Usage

Ensure you have the latest version of Docker and `docker-compose` installed. You may then run `yarn dc:up` which will build the base image by copying the repository and then running `yarn install`. That will then be used to create a `calypso` service, which has its volumes mapped and has Calypso running via `yarn start`. Once that has finished, you may use `yarn dc:logs` to observe the logs for the container running Calypso.

## Troubleshooting

This section has mostly not been filled out yet. We're still working on identifying the issues and limitations of the docker environment.

### Calypso is stuck rebuilding after I checked out a branch

To fix this, you'll need to kill the docker-compose service by running `yarn dc:down` and then `yarn dc:up` again. This effectively mirrors using `ctrl + c` to stop Webpack and then running `yarn start` to start it back up again.

## Known limitations

It is slow to install. One improvement we could make in the future is to publish base images for every checkout of master that could be pulled, preferrably heavily optimized so devs are only pulling the smallest differences and not ending up with hundreds of gigs of docker images clogging their hard drives.

If we do the above then we will inevitably run into disk space issues, so we could do well to add a helper `dc:` command to clean out docker images over a certain age.