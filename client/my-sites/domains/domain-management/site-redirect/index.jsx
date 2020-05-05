/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import page from 'page';
import { localize } from 'i18n-calypso';
import { trim, trimEnd } from 'lodash';

/**
 * Internal dependencies
 */
import Header from 'my-sites/domains/domain-management/components/header';
import FormButton from 'components/forms/form-button';
import FormFieldset from 'components/forms/form-fieldset';
import FormFooter from 'my-sites/domains/domain-management/components/form-footer';
import FormLabel from 'components/forms/form-label';
import FormTextInputWithAffixes from 'components/forms/form-text-input-with-affixes';
import Main from 'components/main';
import Notice from 'components/notice';
import notices from 'notices';
import { domainManagementEdit, domainManagementRedirectSettings } from 'my-sites/domains/paths';
import {
	closeSiteRedirectNotice,
	fetchSiteRedirect,
	updateSiteRedirect,
} from 'state/domains/site-redirect/actions';
import { CompactCard as Card } from '@automattic/components';
import SectionHeader from 'components/section-header';
import { composeAnalytics, recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';
import { getSelectedSite } from 'state/ui/selectors';
import { getSiteRedirectLocation } from 'state/domains/site-redirect/selectors';
import { withoutHttp } from 'lib/url';

/**
 * Style dependencies
 */
import './style.scss';

class SiteRedirect extends React.Component {
	static propTypes = {
		location: PropTypes.object.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		selectedSite: PropTypes.object.isRequired,
	};

	state = {
		redirectUrl: this.props.location.value,
	};

	componentDidMount() {
		this.props.fetchSiteRedirect( this.props.selectedSite.domain );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( this.props.location.value !== nextProps.location.value ) {
			this.setState( {
				redirectUrl: nextProps.location.value,
			} );
		}
	}

	componentWillUnmount() {
		this.closeRedirectNotice();
	}

	closeRedirectNotice = () => {
		this.props.closeSiteRedirectNotice( this.props.selectedSite.domain );
	};

	handleChange = ( event ) => {
		const redirectUrl = withoutHttp( event.target.value );

		this.setState( { redirectUrl } );
	};

	handleClick = () => {
		this.props
			.updateSiteRedirect( this.props.selectedSite.domain, this.state.redirectUrl )
			.then( ( success ) => {
				this.props.recordUpdateSiteRedirectClick(
					this.props.selectedDomainName,
					this.state.redirectUrl,
					success
				);

				if ( success ) {
					page(
						domainManagementRedirectSettings(
							this.props.selectedSite.slug,
							trim( trimEnd( this.state.redirectUrl, '/' ) )
						)
					);
				}
			} );
	};

	handleFocus = () => {
		this.props.recordLocationFocus( this.props.selectedDomainName );
	};

	render() {
		const { location, translate } = this.props;
		const { isUpdating, notice } = location;
		const isFetching = location.isFetching || this.state.redirectUrl.length === 0;

		const classes = classNames( 'site-redirect-card', { fetching: isFetching } );

		return (
			<div>
				<Main>
					<Header onClick={ this.goToEdit } selectedDomainName={ this.props.selectedDomainName }>
						{ translate( 'Redirect Settings' ) }
					</Header>

					{ notice && (
						<Notice
							onDismissClick={ this.closeRedirectNotice }
							status={ notices.getStatusHelper( notice ) }
							text={ notice.text }
						/>
					) }

					<SectionHeader label={ translate( 'Redirect Settings' ) } />

					<Card className={ classes }>
						<form>
							<FormFieldset>
								<FormLabel htmlFor="site-redirect__input">{ translate( 'Redirect To' ) }</FormLabel>

								<FormTextInputWithAffixes
									disabled={ isFetching || isUpdating }
									name="destination"
									noWrap
									onChange={ this.handleChange }
									onFocus={ this.handleFocus }
									prefix="http://"
									type="text"
									value={ this.state.redirectUrl }
									id="site-redirect__input"
								/>

								<p className="site-redirect__explanation">
									{ translate( 'All domains on this site will redirect here.' ) }
								</p>
							</FormFieldset>

							<FormFooter>
								<FormButton disabled={ isFetching || isUpdating } onClick={ this.handleClick }>
									{ translate( 'Update Site Redirect' ) }
								</FormButton>

								<FormButton
									disabled={ isFetching || isUpdating }
									type="button"
									isPrimary={ false }
									onClick={ this.goToEdit }
								>
									{ translate( 'Cancel' ) }
								</FormButton>
							</FormFooter>
						</form>
					</Card>
				</Main>
			</div>
		);
	}

	goToEdit = () => {
		const { selectedDomainName, selectedSite } = this.props;

		this.props.recordCancelClick( selectedDomainName );
		page( domainManagementEdit( selectedSite.slug, selectedDomainName ) );
	};
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

export default connect(
	( state ) => {
		const selectedSite = getSelectedSite( state );
		const location = getSiteRedirectLocation( state, selectedSite.domain );
		return { selectedSite, location };
	},
	{
		fetchSiteRedirect,
		updateSiteRedirect,
		closeSiteRedirectNotice,
		recordCancelClick,
		recordLocationFocus,
		recordUpdateSiteRedirectClick,
	}
)( localize( SiteRedirect ) );
