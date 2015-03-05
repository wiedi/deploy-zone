#!/usr/bin/env bash

set -x
set -o errexit
set -o pipefail
set -o nounset

REPO=$(pwd)
if [ $# -eq 1 ]; then
	REPO="$1"
fi

fail() {
	echo "$*" >&2
	exit 1
}

sanitycheck() {
	[[ -d "${REPO}" ]]           || fail "Build repository ${REPO} doesn\'t exist"
	[[ -f "${REPO}/manifest" ]]  || fail "Can't find manifest"
	[[ -f "${REPO}/customize" ]] || fail "Can't find customize script"
}

header() {
	echo '#!/bin/bash'
	echo 'set -o errexit'
	echo 'set -o pipefail'
	echo 'set -o nounset'
	echo 'export PATH=/opt/local/bin:/opt/local/sbin:/usr/bin:/usr/sbin'
	echo 'trap "mdata-put prepare-image:state error" ERR'
	echo 'mdata-put prepare-image:state running'
}

copyin() {
	echo 'dump_archive() {'
	echo "uudecode -p <<'__EOM__'"
	(cd "${REPO}/copy" && tar -c . | uuencode -m -)
	echo "__EOM__"
	echo '}'
	echo 'dump_archive | gtar -C / -x --no-same-owner'
}

read_manifest() {
	# find something better...
	source "${REPO}/manifest"
}

product() {
	PRODUCT=/etc/product
	echo "echo \"Name: ${organization} ${brand}\" >  $PRODUCT" 
	echo "echo \"Image: ${name} ${version}\"      >> $PRODUCT"
	echo "echo \"Documentation: ${homepage}\"     >> $PRODUCT"
}

motd() {
	[[ ! -f "${REPO}/motd" ]] && return
	echo "cat > /etc/motd <<'__EOM__'"
	(sed	-e "s!%brand%!${brand}!g" \
		-e "s!%name%!${name}!g" \
		-e "s!%version%!${version}!g" \
		-e "s!%homepage%!${homepage}!g" "${REPO}/motd")
	echo "__EOM__"
}

bootstrap() {
	[[ ! -f "${REPO}/bootstrap" ]] && return
	cat "${REPO}/bootstrap"
}

pkg() {
	[[ ! -f "${REPO}/packages" ]] && return
	packages=$( (grep -e ^# -v "${REPO}/packages" || true ) | xargs)
	[[ -z "$packages" ]] && return
	echo "pkgin -f -y up"
	echo "pkg_add -v $packages"
}

customize() {
	cat "${REPO}/customize" | sed 's_^sm-prepare-image -y__g'
	echo 'mdata-put prepare-image:state success'
	echo 'sm-prepare-image -y'
}

main() {
	sanitycheck
	header
	copyin
	read_manifest
	product
	motd
	bootstrap
	pkg
	customize
}

main