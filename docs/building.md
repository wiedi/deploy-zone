# Building SmartOS Images

## Using the deploy-zone utility


	dz build --host smartos.local --basevm <uuid> -o /var/tmp/ .

### Publishing images to imgapi

Use <code>--publish https://user:password@images.example.com</code>

## Compatibility with MIBE

Machine Image repositories for dz look similar to MIBE mi-repositories and are mostly compatible (dz can build mibe repositories). However dz implements a few additional features.

### JSON manifest instead of shell environment

Instead of the MIBE <code>manifest</code> file the dz variant uses a <code>manifest.json</code> file. A dz json manifest can be converted to the MIBE shell file with the followindg command:

	jq -r 'to_entries | .[] | "\(.key)=\(.value|@text|@sh)"' manifest.json > manifest

### Base

With dz the base image used for building can be specified in the manifest (as uuid in the <code>base</code> field). This is inherited from mibed.

### customer_metadata/internal_metadata

New manifest fields <code>customer_metadata</code> and <code>internal_metadata</code> are supported in the manifest. Each can contain an object with the mdata variable names as keys. Each metadata variable has another object as value containing the fields <code>description</code> and <code>type</code>.
Type can either by "text" (default), "boolean" or "number".

Example:

	customer_metadata: {
		"root_authorized_keys": {"description": "One or more SSH public key(s) for the root user", type: "text"},
		...
	}
	
