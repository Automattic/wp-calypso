/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import SectionHeader from 'components/section-header';
import Button from 'components/button';
import Card from 'components/card';
import JetpackModuleToggle from 'my-sites/site-settings/jetpack-module-toggle';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';
import CompactFormToggle from 'components/forms/form-toggle/compact';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackModuleActive } from 'state/selectors';
import InfoPopover from 'components/info-popover';
import ExternalLink from 'components/external-link';

class ThemeEnhancements extends Component {
	static defaultProps = {
		isSavingSettings: false,
		isRequestingSettings: true,
		fields: {}
	};

	static propTypes = {
		onSubmitForm: PropTypes.func.isRequired,
		handleAutosavingToggle: PropTypes.func.isRequired,
		isSavingSettings: PropTypes.bool,
		isRequestingSettings: PropTypes.bool,
		fields: PropTypes.object
	};

	constructor( props ) {
		super( props );

		this.state = {
			infinite_mode: ''
		};
	}

	/**
	 * Update the state for infinite scroll options and prepare options to submit
	 *
	 * @param {string} radio Update options to save when Infinite Scroll options change.
	 */
	updateInfiniteMode = ( radio ) => {
		this.setState( {
			infinite_mode: radio
		} );
	};

	isFormPending() {
		const {
			isRequestingSettings,
			isSavingSettings,
		} = this.props;

		return isRequestingSettings || isSavingSettings;
	}

	renderToggle( name, isDisabled, label ) {
		const { fields, handleAutosavingToggle } = this.props;
		return (
			<CompactFormToggle
				checked={ !! fields[ name ] }
				disabled={ this.isFormPending() || isDisabled }
				onChange={ handleAutosavingToggle( name ) }
			>
				{ label }
			</CompactFormToggle>
		);
	}

	componentWillReceiveProps() {
		if ( ! get( this.props.fields, 'infinite-scroll', '' ) ) {
			this.setState( {
				infinite_mode: 'infinite_default'
			} );
		} else if ( get( this.props.fields, 'infinite_scroll', 'infinite-scroll' ) ) {
			this.setState( {
				infinite_mode: 'infinite_scroll'
			} );
		} else {
			this.setState( {
				infinite_mode: 'infinite_button'
			} );
		}
	}

	handleInfiniteDefault = () => {
		this.updateInfiniteMode( 'infinite_default' );
	};

	handleInfiniteButton = () => {
		this.updateInfiniteMode( 'infinite_button' );
	};

	handleInfiniteScroll = () => {
		this.updateInfiniteMode( 'infinite_scroll' );
	};

	renderInfiniteScrollSettings() {
		const { isRequestingSettings, isSavingSettings, translate } = this.props;

		return (
			<FormFieldset>
				<FormLabel>
					<FormRadio
						name="infinite_mode"
						value="infinite_default"
						checked={ 'infinite_default' === this.state.infinite_mode }
						onChange={ this.handleInfiniteDefault }
						disabled={ isRequestingSettings || isSavingSettings }
						/>
					<span>{ translate( 'Load more posts using the default theme behavior' ) }</span>
				</FormLabel>

				<FormLabel>
					<FormRadio
						name="infinite_mode"
						value="infinite_button"
						checked={ 'infinite_button' === this.state.infinite_mode }
						onChange={ this.handleInfiniteButton }
						disabled={ isRequestingSettings || isSavingSettings }
						/>
					<span>{ translate( 'Load more posts in page with a button' ) }</span>
				</FormLabel>

				<FormLabel>
					<FormRadio
						name="infinite_mode"
						value="infinite_scroll"
						checked={ 'infinite_scroll' === this.state.infinite_mode }
						onChange={ this.handleInfiniteScroll }
						disabled={ isRequestingSettings || isSavingSettings }
						/>
					<span>{ translate( 'Load more posts as the reader scrolls down' ) }</span>
				</FormLabel>
			</FormFieldset>
		);
	}

	renderMinilevenSettings() {
		const {
			selectedSiteId,
			minilevenModuleActive,
			translate
		} = this.props;
		const formPending = this.isFormPending();

		return (
			<FormFieldset>
				<div className="theme-enhancements__info-link-container site-settings__info-link-container">
					<InfoPopover position={ 'left' }>
						<ExternalLink href={ 'https://jetpack.com/support/mobile-theme' } icon target="_blank">
							{ translate( 'Learn more about Mobile Theme.' ) }
						</ExternalLink>
					</InfoPopover>
				</div>

				<JetpackModuleToggle
					siteId={ selectedSiteId }
					moduleSlug="minileven"
					label={ translate( 'Optimize your site with a mobile-friendly theme for tablets and phones' ) }
					disabled={ formPending }
					/>

				<div className="theme-enhancements__module-settings site-settings__child-settings">
					{
						this.renderToggle( 'wp_mobile_excerpt', ! minilevenModuleActive, translate(
							'Show excerpts on front page and on archive pages instead of full posts'
						) )
					}
					{
						this.renderToggle( 'wp_mobile_featured_images', ! minilevenModuleActive, translate(
							'Hide all featured images'
						) )
					}
					{
						this.renderToggle( 'wp_mobile_app_promos', ! minilevenModuleActive, translate(
							'Show an ad for the {{link}}WordPress mobile apps{{/link}} in the footer of the mobile theme',
							{
								components: {
									link: <a href="https://apps.wordpress.com/" />
								}
							}
						) )
					}
				</div>
			</FormFieldset>
		);
	}

	translateAndSubmit = () => {
		let fieldsToSubmit = {};

		if ( 'infinite_default' === this.state.infinite_mode ) {
			fieldsToSubmit = {
				'infinite-scroll': false
			};
		} else if ( 'infinite_scroll' === this.state.infinite_mode || 'infinite_button' === this.state.infinite_mode ) {
			fieldsToSubmit = {
				'infinite-scroll': true,
				infinite_scroll: 'infinite_scroll' === this.state.infinite_mode
			};
		}

		this.props.updateFields( fieldsToSubmit, () => {
			this.props.submitForm();
		} );
	};

	render() {
		const {
			translate,
			isRequestingSettings,
			isSavingSettings
		} = this.props;
		return (
			<div>
				<SectionHeader label={ translate( 'Theme Enhancements' ) }>
					<Button
						compact={ true }
						onClick={ this.translateAndSubmit }
						primary={ true }

						type="submit"
						disabled={ isRequestingSettings || isSavingSettings }>
						{ isSavingSettings
							? translate( 'Saving…' )
							: translate( 'Save Settings' )
						}
					</Button>
				</SectionHeader>

				<Card className="theme-enhancements__card site-settings">
					{ this.renderInfiniteScrollSettings() }

					<hr />

					{ this.renderMinilevenSettings() }
				</Card>
			</div>
		);
	}
}

export default connect(
	( state ) => {
		const selectedSiteId = getSelectedSiteId( state );

		return {
			selectedSiteId,
			infiniteScrollModuleActive: !! isJetpackModuleActive( state, selectedSiteId, 'infinite-scroll' ),
			minilevenModuleActive: !! isJetpackModuleActive( state, selectedSiteId, 'minileven' ),
		};
	}
)( localize( ThemeEnhancements ) );
