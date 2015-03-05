# customer_metadata/internal_metadata documentation with imgapi tags


## Abstract

SmartOS virtual machines can be provided with additional metadata in the properties  <code>customer_metadata</code> and <code>internal_metadata</code>.
While <code>internal_metadata</code> is read-only inside the virtual machine <code>customer_metadata</code> is read-writeable. The vmadm tools in the global zone can read and modify both.

Virtual machines are created from prepared images. Many images make use of these metadata facilities by reading configuration values during provisioning.

This document defines a way to programmatically describe which metadata keys are used by an image by using imgapi tags.


## imgapi tags

SmartOS virtual machine images consist of a zfs filesystem snapshot and a json image manifest. The image manifest may include a <code>tag</code> field containing an object of key/value pairs.

## List of customer_metadata & internal_metadata keys

To document which customer_metadata & internal_metadata keys are accepted by an image some additional tags can be placed into the imgapi manifest.

The tags <code>customer_metadata_keys</code> and <code>internal_metadata_keys</code> hold a space (' ') seperated list of metadata keys.
If the key itself contains spaces this spec does not apply. For simplicity no escaping scheme is defined.

For keys listed in <code>customer_metadata_keys</code> and <code>internal_metadata_keys</code> additional information can published by using tags that depend on the key name.

## Datatype

By creating a tag with the the prefix <code>customer_metadata_type:</code> prepended to the customer_metadata key a datatype can be specified. Possible values currently are:

- "text"
- "boolean"
- "number"

If this tag is not present or a value other than the above choices is set it should be interpreted as "text". This also applies for internal_metadata keys by using the prefix <code>internal_metadata_type:</code>.

## Description

By creating a tag with the prefix <code>customer_metadata_description:</code> prepended to the key the use of this field can be described by text. This also applies for internal_metadata keys by using the prefix <code>internal_metadata_description:</code>. This tag is optional.

## Example

	...
	"tags": {
	    "customer_metadata_keys": "root_authorized_keys syslog_host use_query_cache",
	    "internal_metadata_keys": "mysql_pw",
	    "customer_metadata_description:root_authorized_keys": "One or more SSH public key(s) for the root user",
	    "customer_metadata_type:syslog_host": "text",
	    "customer_metadata_description:syslog_host": "IP address or hostname of remote syslog server",
	    "customer_metadata_type:use_query_cache": "boolean",
	    "customer_metadata_description:use_query_cache": "Enable the query cache (default false)",
	    "internal_metadata_type:mysql_pw": "text",
	    "internal_metadata_description:mysql_pw": "Password for the mysql root user"
	}
	...

This defines three key for `customer_metadata` and one for `internal_metadata`. The type for the `root_authorized_keys` is not set and so 'text' is implied.