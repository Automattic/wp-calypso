import React from 'react';
import SiteInformationCollection from 'calypso/my-sites/marketing/do-it-for-me/site-info-collection';
import './style.scss';

export default function SiteInfoCollectionStep() {
	return (
		<SiteInformationCollection
			typeFormStyles={ {
				width: 'calc(100% - 2px)',
				height: '50vh',
				minHeight: '745px',
				padding: '0',
				marginTop: '50px',
				border: '1px solid rgba( 220, 220, 222, 0.64 )',
				borderRadius: '4px',
			} }
		/>
	);
}
