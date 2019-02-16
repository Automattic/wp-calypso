/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Toggle from 'components/forms/form-toggle';
import { CHANGE_NAME_SERVERS } from 'lib/url/support';
import { composeAnalytics, recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';

class NameserversToggle extends React.PureComponent {
	static propTypes = {
		onToggle: PropTypes.func.isRequired,
		enabled: PropTypes.bool.isRequired,
	};

	render() {
		return (
			<div className="name-servers__dns is-compact card">
				<span className="name-servers__title">
					{ this.props.translate( 'Use WordPress.com Name Servers' ) }
				</span>

				<form className="name-servers__toggle">
					<Toggle
						id="wp-nameservers"
						name="wp-nameservers"
						onChange={ this.handleToggle }
						type="checkbox"
						checked={ this.props.enabled }
						value="active"
					/>
				</form>
				{ this.renderExplanation() }
			</div>
		);
	}

	handleToggle = () => {
		this.props.wpcomNameServersToggleButtonClick(
			this.props.selectedDomainName,
			! this.props.enabled
		);
		this.props.onToggle();
	};

	renderExplanation() {
		if ( ! this.props.enabled ) {
			return null;
		}

		return (
			<p className="name-servers__explanation">
				{ this.props.translate(
					'Name servers point your domain to the right website host, like WordPress.com. ' +
						'{{a}}Learn more.{{/a}}',
					{
						components: {
							a: (
								<a
									href={ CHANGE_NAME_SERVERS }
									target="_blank"
									rel="noopener noreferrer"
									onClick={ this.handleLearnMoreClick }
								/>
							),
						},
					}
				) }
			</p>
		);
	}

	handleLearnMoreClick = () => {
		this.props.wpcomNameServersLearnMoreClick( this.props.selectedDomainName );
	};
}

const wpcomNameServersToggleButtonClick = ( domainName, enabled ) => {
	const state = enabled ? 'On' : 'Off';

	return composeAnalytics(
		recordGoogleEvent(
			'Domain Management',
			`Click Toggle Button in "Use WordPress.com Name Servers" Section to "${ state }" in Name Servers and DNS`,
			'Domain Name',
			domainName
		),
		recordTracksEvent(
			'calypso_domain_management_name_servers_wpcom_name_servers_toggle_button_click',
			{
				domain_name: domainName,
				enabled,
			}
		)
	);
};

const wpcomNameServersLearnMoreClick = domainName =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Management',
			'Clicked "Learn More" link in "Use WordPress.com Name Servers" Section in Name Servers and DNS',
			'Domain Name',
			domainName
		),
		recordTracksEvent(
			'calypso_domain_management_name_servers_wpcom_name_servers_learn_more_click',
			{ domain_name: domainName }
		)
	);

export default connect(
	null,
	{
		wpcomNameServersLearnMoreClick,
		wpcomNameServersToggleButtonClick,
	}
)( localize( NameserversToggle ) );
