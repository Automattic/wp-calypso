import page from '@automattic/calypso-router';
import { localizeUrl } from '@automattic/i18n-utils';
import { SITE_REDIRECT } from '@automattic/urls';
import { createHigherOrderComponent } from '@wordpress/compose';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect, useSelector } from 'react-redux';
import FormButton from 'calypso/components/forms/form-button';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextInputWithAffixes from 'calypso/components/forms/form-text-input-with-affixes';
import { withoutHttp } from 'calypso/lib/url';
import { domainManagementSiteRedirect } from 'calypso/my-sites/domains/paths';
import {
	composeAnalytics,
	recordGoogleEvent,
	recordTracksEvent,
} from 'calypso/state/analytics/actions';
import {
	closeSiteRedirectNotice,
	fetchSiteRedirect,
	updateSiteRedirect,
} from 'calypso/state/domains/site-redirect/actions';
import { getSiteRedirectLocation } from 'calypso/state/domains/site-redirect/selectors';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { fetchSiteDomains } from 'calypso/state/sites/domains/actions';
import { getSelectedSite } from 'calypso/state/ui/selectors';

import './style.scss';

const noticeOptions = {
	duration: 5000,
	id: `site-redirect-update-notification`,
};

class SiteRedirectCard extends Component {
	static propTypes = {
		location: PropTypes.object.isRequired,
		redesign: PropTypes.bool,
		selectedDomainName: PropTypes.string.isRequired,
		selectedSite: PropTypes.object.isRequired,
	};

	state = {
		redirectUrl: this.props.location.value ?? '',
	};

	componentDidMount() {
		if ( this.props.selectedSite ) {
			this.props.fetchSiteRedirect( this.props.selectedSite.domain );
		}
	}

	componentWillUnmount() {
		this.closeRedirectNotice();
	}

	closeRedirectNotice = () => {
		if ( this.props.selectedSite ) {
			this.props.closeSiteRedirectNotice( this.props.selectedSite.domain );
		}
	};

	handleChange = ( event ) => {
		const redirectUrl = withoutHttp( event.target.value );

		this.setState( { redirectUrl } );
	};

	handleClick = () => {
		if ( this.props.selectedSite ) {
			this.props
				.updateSiteRedirect( this.props.selectedSite.domain, this.state.redirectUrl )
				.then( ( success ) => {
					this.props.recordUpdateSiteRedirectClick(
						this.props.selectedDomainName,
						this.state.redirectUrl,
						success
					);

					if ( success ) {
						this.props.fetchSiteDomains( this.props.selectedSite.ID );
						this.props.fetchSiteRedirect( this.state.redirectUrl.replace( /\/+$/, '' ).trim() );

						page(
							domainManagementSiteRedirect(
								this.props.selectedSite.slug,
								this.state.redirectUrl.replace( /\/+$/, '' ).trim(),
								this.props.currentRoute
							)
						);

						this.props.successNotice(
							this.props.translate( 'Site redirect updated successfully.' ),
							noticeOptions
						);
					} else {
						this.props.errorNotice( this.props.location.notice.text );
					}
				} );
		}
	};

	handleFocus = () => {
		this.props.recordLocationFocus( this.props.selectedDomainName );
	};

	getNoticeStatus( notice ) {
		if ( notice?.error ) {
			return 'is-error';
		}
		if ( notice?.success ) {
			return 'is-success';
		}
		return 'is-info';
	}

	render() {
		const { location, translate } = this.props;
		const { isUpdating, isFetching } = location;

		return (
			<form>
				<FormFieldset>
					<FormTextInputWithAffixes
						disabled={ isFetching || isUpdating }
						name="destination"
						noWrap
						onChange={ this.handleChange }
						onFocus={ this.handleFocus }
						prefix="http://"
						value={ this.state.redirectUrl }
						id="site-redirect__input"
					/>

					<p className="site-redirect-card__explanation">
						{ translate(
							'All domains on this site will redirect here as long as this domain is set as your primary domain. ' +
								'{{learnMoreLink}}Learn more{{/learnMoreLink}}',
							{
								components: {
									learnMoreLink: (
										<a
											href={ localizeUrl( SITE_REDIRECT ) }
											target="_blank"
											rel="noopener noreferrer"
										/>
									),
								},
							}
						) }
					</p>
				</FormFieldset>

				<FormButton
					disabled={
						isFetching || isUpdating || this.props.location.value === this.state.redirectUrl
					}
					onClick={ this.handleClick }
				>
					{ translate( 'Update' ) }
				</FormButton>
			</form>
		);
	}
}

const recordCancelClick = ( domainName ) =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Management',
			'Clicked "Cancel" Button in Site Redirect',
			'Domain Name',
			domainName
		),
		recordTracksEvent( 'calypso_domain_management_site_redirect_cancel_click', {
			domain_name: domainName,
		} )
	);

const recordLocationFocus = ( domainName ) =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Management',
			'Focused On "Location" Input in Site Redirect',
			'Domain Name',
			domainName
		),
		recordTracksEvent( 'calypso_domain_management_site_redirect_location_focus', {
			domain_name: domainName,
		} )
	);

const recordUpdateSiteRedirectClick = ( domainName, location, success ) =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Management',
			'Clicked "Update Site Redirect" Button in Site Redirect',
			'Domain Name',
			domainName
		),
		recordTracksEvent( 'calypso_domain_management_site_redirect_update_site_redirect_click', {
			domain_name: domainName,
			location,
			success,
		} )
	);

const withLocationAsKey = createHigherOrderComponent( ( Wrapped ) => ( props ) => {
	const selectedSite = useSelector( getSelectedSite );
	const location = useSelector( ( state ) =>
		getSiteRedirectLocation( state, selectedSite?.domain )
	);

	return <Wrapped { ...props } key={ `redirect-${ location.value }` } />;
} );

export default connect(
	( state ) => {
		const selectedSite = getSelectedSite( state );
		const location = getSiteRedirectLocation( state, selectedSite?.domain );
		const currentRoute = getCurrentRoute( state );
		return { selectedSite, location, currentRoute };
	},
	{
		fetchSiteRedirect,
		fetchSiteDomains,
		updateSiteRedirect,
		closeSiteRedirectNotice,
		recordCancelClick,
		recordLocationFocus,
		recordUpdateSiteRedirectClick,
		successNotice,
		errorNotice,
	}
)( localize( withLocationAsKey( SiteRedirectCard ) ) );
