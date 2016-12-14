/**
* External dependencies
*/
import React, { Component } from 'react';

/**
* Internal dependencies
*/
import InfoLink from 'components/info-link';
import ExternalLink from 'components/external-link';
import Card from 'components/card';
import SectionHeader from 'components/section-header';

class InfoLinkExample extends Component {
	static displayName = 'InfoLink';

	render() {
		return (
			<SectionHeader label={ 'Speed up your images and photon with Photon' }>
				<InfoLink href={ 'https://jetpack.com/support/photon/' }>
					Learn more about Photon
				</InfoLink>
			</SectionHeader>
		);
	}
}

export default InfoLinkExample;
