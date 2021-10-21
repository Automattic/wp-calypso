import InlineSupportLink from 'calypso/components/inline-support-link';

function PodcastingSupportLink( { showText, iconSize } ) {
	return (
		<InlineSupportLink
			className="podcasting-details__support-link"
			supportContext="podcasting"
			showText={ showText }
			iconSize={ iconSize }
		/>
	);
}

export default PodcastingSupportLink;
