# dz / deploy-zone

This is `dz` - the "deploy zone" utility.

It allows you to manage zone deployments on a fleet of SmartOS systems without the need for cloud orchestration. It uses ssh for transport and authentication. There are no daemons or other changes to your SmartOS global zone.

## Getting started

### Installation

	# npm install -g deploy-zone

### Register SmartOS Hosts

First register some SmartOS Hosts (make sure your user has ssh access):

	# dz host add host-a.dev.example.com
	# dz host add host-b.dev.example.com
	# dz host add host-c.prod.example.com

That way `dz` knows your servers. It will also retrieve some metadata like ram and storage size. If you [configured your datacenter name](https://twitter.com/docscream/status/557612957690236930) on the SmartOS system this will also be shown:

	# dz host list
	datacenter  host                     ram        storage  tags
	----------  -----------------------  ---------  -------  ----
	de-bln-f15  host-a.dev.example.com   3.87 GB    2.63 TB      
	de-bln-f15  host-b.dev.example.com   7.87 GB    2.63 TB      
	de-muc-ipx  host-c.prod.example.com  107.99 GB  5.25 TB      

### Regular Usage

With `dz list` you can view all running zones across your servers:


	# dz list
	host                     uuid                                  type  ram    quota  state    hostname              alias               
	-----------------------  ------------------------------------  ----  -----  -----  -------  --------------------  --------------------
	 host-a.dev.example.com  ab68ea68-d192-40a8-97c6-deca4f1710b1  OS     4096     10  running      fifo.f.fruky.net  fifo                
	 host-a.dev.example.com  8662a174-12c9-412d-8e23-b0110c68a107  OS     2048     10  running      blog.example.com  blog                
	 host-a.dev.example.com  0b1660f2-0894-48d0-9434-3320bab94c88  OS     1024   6000  running               store-a  store-a             
	 host-a.dev.example.com  c11f26ba-0395-4723-9c2b-0d98931ce182  KVM    1024     10  stopped                        netbsd              
	 host-b.dev.example.com  06709ee8-ae32-48e4-a690-78276eb13825  LX     2048    100  running                        lx                  
	 host-b.dev.example.com  594f44de-1bb4-417e-895b-c6bc129299e9  OS      256     10  stopped                        dhcpv6-a            
	host-c.prod.example.com  a4f7644b-4508-4721-ab73-57e3855fbfab  OS     2048     64  running  datasets.example.com  datasets.example.com
	host-c.prod.example.com  261b3522-8ec6-40f3-ad48-e5882d8e0a98  OS     2048     10  running  graphite.example.com  graphite.example.com
	host-c.prod.example.com  782c2631-85d1-44d4-9645-d5701fa42736  OS     2048     10  running   jenkins.example.com  jenkins.example.com 

This command also builds a local cache. If you want don't want to query all servers you can view the cached state with `dz list -c`.

The cache also enables you to start and stop zones with just passing the uuid. No need for a host parameter as dz will know where to look:

	# dz start c11f26ba-0395-4723-9c2b-0d98931ce182

And there is a `dz shell` command to zlogin:

	# dz shell d61b272f-2aea-4944-b8da-20c7b2c5331a
	[Connected to zone 'd61b272f-2aea-4944-b8da-20c7b2c5331a' pts/6]
	Last login: Thu Nov  6 07:55:53 on pts/2

	╭──────────────────────────────────────────────────────────────────────╮
	│ ✜ CORE.IO NS                                                         │
	╰──────────────────────────────────────────────────────────────────────╯
 
	[ core-ns 14.2.1 | https://github.com/skylime/mi-core-ns ]
 
	[root@ns ~]#


### Building new Images

The `dz build` command provides an easy way to generate new vm images.
If you have used [MIBE](https://github.com/joyent/mibe) before you can reuse your mi-repository. If not take a look at the [mi-example](https://github.com/joyent/mi-example).

This repository contains a `copy` folder with files that will be copied into the vm. It also contains a `packages` file with information which pkgsrc packages to install. And finally there is a `customize` shell script which allows you to execute commands.

While this is all very simple it can be combined with [zoneinit](https://github.com/joyent/zoneinit), delegated zfs datasets and the `mdata` tools to create a powerful deployment method for software.

There are plenty mi-* [repositories](https://github.com/skylime/) on github which can serve as examples.

In contrast to MIBE (which requires modifications to the global zone) the `dz build` command uses `imgadm create`. This is also more flexible with regards to publishing datasets to remote IMGAPI servers.

## Development status

This is still very experimental. It started out as one weekends proof of concept.
There are many bugs and user interface issues. Some commands (`dz images`, ...) are simply not working. There is no tab completion. There is no way to create new zones just yet. These are all bugs that I wish to fix and help with that is definitly welcome!

Just be warned that this far from a finished product.

## Why is this useful?

SmartOS is a hypervisor for cloud deployments. If you want a cloud look at [Project FiFo](https://project-fifo.net) or [SDC](https://github.com/joyent/sdc/). A real cloud provides you with real tools for automation and management.

Yet SmartOS is a useful hypervisor on its own and deployments of many systems accross different datacenters or in constrained networks might not be the best fit for a cloud. Here `dz` can provide basic functionality without the need for a central management system.

The `dz build` command may also be useful in standard cloud environments.

