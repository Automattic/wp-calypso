/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getSelectedSiteId, getSelectedSite } from 'state/ui/selectors';
import { isRequestingPostTypes, getPostTypes } from 'state/post-types/selectors';
import { getSiteSlug, isJetpackMinimumVersion } from 'state/sites/selectors';
import { addSiteFragment } from 'lib/route';
import QueryPostTypes from 'components/data/query-post-types';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormToggle from 'components/forms/form-toggle';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import SectionHeader from 'components/section-header';
import Card from 'components/card';
import FeatureExample from 'components/feature-example';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';

class CustomPostTypesFieldset extends Component {
	constructor( props ) {
		super( props );

		this.boundToggleTestimonial = this.onChange.bind( this, 'jetpack-testimonial' );
		this.boundTogglePortfolio = this.onChange.bind( this, 'jetpack-portfolio' );
		this.state = { hadOnceEnabled: {} };
	}

	componentWillMount() {
		this.updateHadOnceEnabled();
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.siteId !== nextProps.siteId ) {
			this.setState( { hadOnceEnabled: {} }, this.updateHadOnceEnabled );
		} else {
			this.updateHadOnceEnabled( nextProps );
		}
	}

	updateHadOnceEnabled( props = this.props ) {
		this.setState( {
			hadOnceEnabled: [
				'jetpack-testimonial',
				'jetpack-portfolio'
			].reduce( ( memo, postType ) => {
				const valueKey = this.getPostTypeValueKey( postType );
				memo[ postType ] = this.state.hadOnceEnabled[ postType ] || props.value[ valueKey ];
				return memo;
			}, {} )
		} );
	}

	hasDefaultPostTypeEnabled( postType ) {
		return (
			this.props.postTypes &&
			! this.state.hadOnceEnabled[ postType ] &&
			false === this.props.value[ this.getPostTypeValueKey( postType ) ] &&
			!! this.props.postTypes[ postType ]
		);
	}

	getPostTypeValueKey( postType ) {
		if ( 'jetpack-testimonial' === postType ) {
			return 'jetpack_testimonial';
		}

		if ( 'jetpack-portfolio' === postType ) {
			return 'jetpack_portfolio';
		}
	}

	isEnabled( postType ) {
		return (
			this.hasDefaultPostTypeEnabled( postType ) ||
			this.props.value[ this.getPostTypeValueKey( postType ) ]
		);
	}

	isDisabled( postType ) {
		const { requestingSettings, requestingPostTypes } = this.props;
		return requestingSettings || requestingPostTypes || this.hasDefaultPostTypeEnabled( postType );
	}

	onChange( postType ) {
		const { recordEvent, onChange } = this.props;

		switch ( postType ) {
			case 'jetpack-testimonial': recordEvent( 'Clicked Jetpack Testimonial CPT Checkbox' ); break;
			case 'jetpack-portfolio': recordEvent( 'Clicked Jetpack Portfolio CPT Checkbox' ); break;
		}

		onChange( {
			[ this.getPostTypeValueKey( postType ) ]: ! this.isEnabled( postType )
		} );
	}

	render() {
		const { translate, siteId, siteSlug, siteUrl, className, siteSupportsCustomTypes } = this.props;
		const ToggleWrapper = siteSupportsCustomTypes ? 'div' : FeatureExample;

		return (
			<FormFieldset className={ className }>
				{ siteId && (
					<QueryPostTypes siteId={ siteId } />
				) }
				<FormLabel>{ translate( 'Custom Content Types' ) }</FormLabel>
				<p>
					{ translate( 'Display different types of content on your site with {{link}}custom content types{{/link}}.', {
						components: {
							link: <a href="https://en.support.wordpress.com/custom-post-types/" target="_blank" />
						}
					} ) }
				</p>
				{ ! siteSupportsCustomTypes && (
					<Notice
						status="is-warning"
						showDismiss={ false }
						text={ translate( 'You must update to the latest version of Jetpack to use this feature' ) }>
						<NoticeAction href={ addSiteFragment( '/plugins/jetpack', siteSlug ) }>
							{ translate( 'Update', { context: 'verb' } ) }
						</NoticeAction>
					</Notice>
				) }
				<ToggleWrapper>
					<div className="site-settings__custom-post-type">
						<SectionHeader label={ translate( 'Testimonials' ) }>
							<FormToggle
								checked={ this.isEnabled( 'jetpack-testimonial' ) }
								onChange={ this.boundToggleTestimonial }
								disabled={ this.isDisabled( 'jetpack-testimonial' ) } />
						</SectionHeader>
						<Card>
							{ this.hasDefaultPostTypeEnabled( 'jetpack-testimonial' ) && (
								<FormSettingExplanation>{ translate( 'Your theme supports Testimonials' ) }</FormSettingExplanation>
							) }
							{ translate(
								'The Testimonial custom content type allows you to add, organize, and display your ' +
								'testimonials. If your theme doesn’t support it yet, you can display testimonials using ' +
								'the {{shortcodeLink}}testimonial shortcode{{/shortcodeLink}} ( {{code}}[testimonials]{{/code}} ) ' +
								'or you can {{archiveLink}}view a full archive of your testimonials{{/archiveLink}}.',
								{
									components: {
										shortcodeLink: <a href="https://support.wordpress.com/testimonials-shortcode/" />,
										code: <code />,
										archiveLink: <a href={ siteUrl.replace( /\/$/, '' ) + '/testimonial' } />
									}
								}
							) }
						</Card>
					</div>
					<div className="site-settings__custom-post-type">
						<SectionHeader label={ translate( 'Portfolio Projects' ) }>
							<FormToggle
								checked={ this.isEnabled( 'jetpack-portfolio' ) }
								onChange={ this.boundTogglePortfolio }
								disabled={ this.isDisabled( 'jetpack-portfolio' ) } />
						</SectionHeader>
						<Card>
							{ this.hasDefaultPostTypeEnabled( 'jetpack-portfolio' ) && (
								<FormSettingExplanation>{ translate( 'Your theme supports Portfolio Projects' ) }</FormSettingExplanation>
							) }
							{ translate(
								'The Portfolio custom content type gives you an easy way to manage and showcase projects ' +
								'on your site. If your theme doesn’t support it yet, you can display the portfolio using ' +
								'the {{shortcodeLink}}portfolio shortcode{{/shortcodeLink}} ( {{code}}[portfolio]{{/code}} ) ' +
								'or you can {{archiveLink}}view a full archive of your portfolio projects{{/archiveLink}}.',
								{
									components: {
										shortcodeLink: <a href="https://support.wordpress.com/portfolios/portfolio-shortcode/" />,
										code: <code />,
										archiveLink: <a href={ siteUrl.replace( /\/$/, '' ) + '/portfolio' } />
									}
								}
							) }
						</Card>
					</div>
				</ToggleWrapper>
			</FormFieldset>
		);
	}
}

CustomPostTypesFieldset.propTypes = {
	translate: PropTypes.func,
	requestingSettings: PropTypes.bool,
	value: PropTypes.object,
	onChange: PropTypes.func,
	recordEvent: PropTypes.func,
	className: PropTypes.string,
	siteId: PropTypes.number,
	siteSlug: PropTypes.string,
	siteUrl: PropTypes.string,
	requestingPostTypes: PropTypes.bool,
	postTypes: PropTypes.object,
	siteSupportsCustomTypes: PropTypes.bool
};

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const site = getSelectedSite( state );

	return {
		siteId,
		siteSlug: getSiteSlug( state, siteId ),
		siteUrl: site ? site.URL : '',
		requestingPostTypes: isRequestingPostTypes( state, siteId ),
		postTypes: getPostTypes( state, siteId ),
		siteSupportsCustomTypes: false !== isJetpackMinimumVersion( state, siteId, '4.2.0' )
	};
} )( localize( CustomPostTypesFieldset ) );
