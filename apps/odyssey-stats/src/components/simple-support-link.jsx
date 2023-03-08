import ExternalLink from 'calypso/components/external-link';

export default function SimpleSupportLink( { supportContext, ...otherProps } ) {
	let link = 'https://jetpack.com/support';
	switch ( supportContext ) {
		case 'stats':
			link = 'https://jetpack.com/support/jetpack-stats/';
	}

	return <ExternalLink href={ link } { ...otherProps } />;
}
