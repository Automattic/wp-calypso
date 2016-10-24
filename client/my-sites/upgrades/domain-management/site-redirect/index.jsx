/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import page from 'page';

/**
 * Internal dependencies
 */
import analyticsMixin from 'lib/mixins/analytics';
import Header from 'my-sites/upgrades/domain-management/components/header';
import FormButton from 'components/forms/form-button';
import FormFieldset from 'components/forms/form-fieldset';
import FormFooter from 'my-sites/upgrades/domain-management/components/form-footer';
import FormLabel from 'components/forms/form-label';
import FormTextInputWithAffixes from 'components/forms/form-text-input-with-affixes';
import Main from 'components/main';
import SiteRedirectNotice from './notice';
import paths from 'my-sites/upgrades/paths';
import * as upgradesActions from 'lib/upgrades/actions';
import Card from 'components/card/compact';
import SectionHeader from 'components/section-header';

const SiteRedirect = React.createClass( {
	mixins: [ analyticsMixin( 'domainManagement', 'siteRedirect' ) ],

	propTypes: {
		location: React.PropTypes.object.isRequired,
		selectedDomainName: React.PropTypes.string.isRequired,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired
	},

	componentWillMount() {
		upgradesActions.fetchSiteRedirect( this.props.selectedSite.domain );
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( this.props.location.value !== nextProps.location.value ) {
			this.setState( {
				location: nextProps.location.value
			} );
		}
	},

	componentWillUnmount() {
		upgradesActions.closeSiteRedirectNotice( this.props.selectedSite.domain );
	},

	getInitialState() {
		return {
			location: this.props.location.value
		};
	},

	handleChange( event ) {
		let location = event.target.value;

		// Removes the protocol part
		location = location.replace( /.*:\/\//, '' );

		this.setState( { location } );
	},

	handleClick( event ) {
		event.preventDefault();

		upgradesActions.updateSiteRedirect( this.props.selectedSite.domain, this.state.location, ( success ) => {
			this.recordEvent( 'updateSiteRedirectClick', this.props.selectedDomainName, this.state.location, success );

			if ( success ) {
				page( paths.domainManagementRedirectSettings( this.props.selectedSite.slug, this.state.location ) );
			}
		} );
	},

	handleFocus() {
		this.recordEvent( 'locationFocus', this.props.selectedDomainName );
	},

	render() {
		let classes = classNames(
			'site-redirect-card',
			{ fetching: this.props.location.isFetching }
		);

		return (
			<div>
				<SiteRedirectNotice
					notice={ this.props.location.notice }
					selectedSite={ this.props.selectedSite } />

				<Main className="domain-management-site-redirect">
					<Header onClick={ this.goToEdit } selectedDomainName={ this.props.selectedDomainName }>
						{ this.translate( 'Redirect Settings' ) }
					</Header>

					<SectionHeader label={ this.translate( 'Redirect Settings' ) } />

					<Card className={ classes }>
						<form>
							<FormFieldset>
								<FormLabel>
									{ this.translate( 'Redirect To' ) }
								</FormLabel>

								<FormTextInputWithAffixes
									disabled={ this.props.location.isFetching || this.props.location.isUpdating }
									name="destination"
									noWrap
									onChange={ this.handleChange }
									onFocus={ this.handleFocus }
									prefix="http://"
									type="text"
									value={ this.state.location } />

								<p className="site-redirect__explanation">
									{ this.translate( 'All domains on this site will redirect here.' ) }
								</p>
							</FormFieldset>

							<FormFooter>
								<FormButton
									disabled={ this.props.location.isFetching || this.props.location.isUpdating }
									onClick={ this.handleClick }>
									{ this.translate( 'Update Site Redirect' ) }
								</FormButton>

								<FormButton
									type="button"
									isPrimary={ false }
									onClick={ this.goToEdit }>
									{ this.translate( 'Cancel' ) }
								</FormButton>
							</FormFooter>
						</form>
					</Card>
				</Main>
			</div>
		);
	},

	goToEdit() {
		this.recordEvent( 'cancelClick', this.props.selectedDomainName );

		page( paths.domainManagementEdit( this.props.selectedSite.slug, this.props.selectedDomainName ) );
	}
} );

export default SiteRedirect;
