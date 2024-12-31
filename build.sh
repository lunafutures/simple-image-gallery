#! /bin/bash
set -ex

name=$npm_package_name
version=$npm_package_version
if [[ -z $name || -z $version ]]; then
	echo "\$name and \$version cannot be empty. Run this script from \`npm run\`."
	exit 1
else
	echo name=${name}
	echo version=${version}
fi

docker buildx build --platform linux/amd64,linux/arm64 -t ${name}:${version} --load .

docker tag "${name}:${version}" "lunafutures/${name}:${version}"
docker push "lunafutures/${name}:${version}"

docker tag "${name}:${version}" "lunafutures/${name}:latest"
docker push "lunafutures/${name}:latest"