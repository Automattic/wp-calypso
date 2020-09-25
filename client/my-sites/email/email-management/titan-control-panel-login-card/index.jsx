/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import { Button, CompactCard } from '@automattic/components';
import SectionHeader from 'components/section-header';

class TitanControlPanelLoginCard extends React.Component {
	state = {
		isFetchingAutoLoginLink: false,
	};

	onLogInClick = () => {};

	render() {
		const { domain, translate } = this.props;
		const translateArgs = {
			args: {
				domainName: domain.name,
			},
			comment: '%(domainName)s is a domain name, e.g. example.com',
		};

		return (
			<div>
				<SectionHeader label={ translate( 'Titan Mail: %(domainName)s', translateArgs ) }>
					<Button
						primary
						compact
						busy={ this.state.isFetchingAutoLoginLink }
						onClick={ this.onLogInClick }
					>
						{ translate( "Log in to Titan's control panel" ) }
					</Button>
				</SectionHeader>
				<CompactCard>
					{ translate(
						"Go to Titan's control panel to manage email for %(domainName)s.",
						translateArgs
					) }
				</CompactCard>
			</div>
		);
	}
}

export default localize( TitanControlPanelLoginCard );
