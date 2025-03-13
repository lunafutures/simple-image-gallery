# Simple Image Gallery

This is a self-hosted simple image gallery that can display uploaded images including gifs to share with friends. No accounts are required to view and upload.

![Example of app](readme_assets/simple-gallery.gif)

## Docker

How to run this as a docker container:

```sh
docker run \
    -p <your_desired_port>:3000 \
    -v <host_directory>:/app/uploads \
    -e BASE_PATH=<base_path> \
     lunafutures/simple-image-gallery:latest
```

- `<your_desired_port>` is the port your container will listen to. For example, if you specify `-p 1234:3000`, the service will be accessible at `localhost:1234`
- `<host_directory>` is the mapped volume path for images and where images will be uploaded to.
- `<base_path>` is a base path added to avoid conflicts with other services. For example, if you specify `-e BASE_PATH=base` then the service will be accessible at `localhost:<your_desired_port>/base`. Defaults to `gallery` if not specified. But you can also specify `-e BASE_PATH=` to ensure no base path and then the service will be accessible at `localhost:<your_desired_port>/` instead.