<!-- @format -->

# Utils Folder

This folder contains files that are used by blocks of this preset but contains
files that are not automatically bundled. But included on an individual basis instead.

## getJetpackData()

Gets a list of available blocks, and jetpack's connection status.
On a Jetpack site, there are special cases when a block is considered unavailable.
For example, the site may not have the required module, they may not have the required plan,
or the site admin may have filtered out the use of a certain block.

## registerJetpackBlock()

This util will only register a block if it meets the availability requirements described above.


## registerJetpackPlugin()

This util will only register a Gutenberg plugin if it meets the availability requirements described above.
