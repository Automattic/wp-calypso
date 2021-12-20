import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import { CHANGE_NAME_SERVERS } from 'calypso/lib/url/support';
import {
	composeAnalytics,
	recordGoogleEvent,
	recordTracksEvent,
} from 'calypso/state/analytics/actions';

const NameserversToggle = ( props ) => {
	const translate = useTranslate();
	// static propTypes = {
	// 	onToggle: PropTypes.func.isRequired,
	// 	enabled: PropTypes.bool.isRequired,
	// };

	const handleToggle = () => {
		props.wpcomNameServersToggleButtonClick( props.selectedDomainName, ! props.enabled );
		props.onToggle();
	};

	const renderExplanation = () => {
		if ( ! props.enabled ) {
			return null;
		}

		return (
			<p className="name-servers__explanation">
				{ translate(
					'Name servers point your domain to the right website host, like WordPress.com. ' +
						'{{a}}Learn more.{{/a}}',
					{
						components: {
							a: (
								<a
									href={ CHANGE_NAME_SERVERS }
									target="_blank"
									rel="noopener noreferrer"
									onClick={ handleLearnMoreClick }
								/>
							),
						},
					}
				) }
			</p>
		);
	};

	const handleLearnMoreClick = () => {
		props.wpcomNameServersLearnMoreClick( props.selectedDomainName );
	};

	return (
		<>
			<form className="name-servers__toggle">
				<ToggleControl
					id="wp-nameservers"
					name="wp-nameservers"
					onChange={ handleToggle }
					checked={ props.enabled }
					value="active"
					label={ translate( 'Point to WordPress.com name servers' ) }
				/>
			</form>
			{ /* { renderExplanation() } */ }
		</>
	);
};

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

const wpcomNameServersLearnMoreClick = ( domainName ) =>
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

export default connect( null, {
	wpcomNameServersLearnMoreClick,
	wpcomNameServersToggleButtonClick,
} )( NameserversToggle );
