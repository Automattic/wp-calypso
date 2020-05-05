/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import { Card, Button } from '@automattic/components';
import SectionHeader from 'components/section-header';
import { localizeUrl } from 'lib/i18n-utils';

class HostSelect extends React.Component {
	static displayName = 'HostSelect';

	static propTypes = {
		hosts: PropTypes.arrayOf(
			PropTypes.shape( {
				showHost: PropTypes.func.isRequired,
				label: PropTypes.string.isRequired,
				logo: PropTypes.string.isRequired,
			} )
		).isRequired,
	};

	render() {
		const { hosts } = this.props;

		return (
			<div>
				<SectionHeader label={ this.props.translate( 'Set up Guided Transfer' ) } />
				<Card>
					<p>
						{ this.props.translate(
							'{{strong}}Please choose{{/strong}} one of our Guided Transfer compatible ' +
								'{{partner_link}}partner hosts{{/partner_link}}. Visit the {{lobby_link}}Guided ' +
								'Transfer Lobby{{/lobby_link}} if you have any questions before starting, or ' +
								'{{learn_link}}learn more{{/learn_link}} about the process.',
							{
								components: {
									strong: <strong />,
									partner_link: <a href="https://get.wp.com/gt-hosting/" />,
									lobby_link: <a href="https://guidedtransfer.wordpress.com/" />,
									learn_link: (
										<a href={ localizeUrl( 'https://wordpress.com/support/guided-transfer/' ) } />
									),
								},
							}
						) }
					</p>
					<div>
						{ hosts.map( ( host, index ) => {
							const { showHost, label, logo } = host;
							return (
								<Button
									className="guided-transfer__host-button"
									onClick={ showHost }
									key={ index }
									aria-label={ label }
								>
									<img className="guided-transfer__host-button-image" src={ logo } alt="" />
								</Button>
							);
						} ) }
					</div>
				</Card>
			</div>
		);
	}
}

export default localize( HostSelect );
