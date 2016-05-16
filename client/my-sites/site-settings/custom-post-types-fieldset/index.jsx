/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { isRequestingPostTypes, getPostTypes } from 'state/post-types/selectors';
import localize from 'lib/mixins/i18n/localize';
import QueryPostTypes from 'components/data/query-post-types';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormToggle from 'components/forms/form-toggle';
import FormSettingExplanation from 'components/forms/form-setting-explanation';

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
		this.props.onChange( {
			[ this.getPostTypeValueKey( postType ) ]: ! this.isEnabled( postType )
		} );
	}

	render() {
		const { translate, siteId, recordEvent, className } = this.props;

		return (
			<FormFieldset className={ className }>
				{ siteId && (
					<QueryPostTypes siteId={ siteId } />
				) }
				<FormLabel>{ translate( 'Custom Content Types' ) }</FormLabel>
				<p>
					{ translate( 'Display different types of content on your site with {{link}}custom content types{{/link}}.', {
						components: {
							link: <a href="https://jetpack.com/support/custom-content-types/" target="_blank" />
						}
					} ) }
				</p>
				<FormLabel>
					<FormToggle
						checked={ this.isEnabled( 'jetpack-testimonial' ) }
						onChange={ this.boundToggleTestimonial }
						disabled={ this.isDisabled( 'jetpack-testimonial' ) }
						onClick={ recordEvent( 'Clicked Jetpack Testimonial CPT Checkbox' ) }>
						{ translate( 'Testimonials' ) }
					</FormToggle>
				</FormLabel>
				{ this.hasDefaultPostTypeEnabled( 'jetpack-testimonial' ) && (
					<FormSettingExplanation>{ translate( 'Your theme supports Testimonials' ) }</FormSettingExplanation>
				) }
				<p>
					{ translate( 'The Testimonial custom content type allows you to add, organize, and display your testimonials. If your theme doesn’t support it yet, you can display testimonials using the {{shortcodeLink}}testimonial shortcode{{/shortcodeLink}} ( {{code}}[testimonials]{{/code}} ) or you can view a full archive of your testimonials at yourgroovydomain.com/testimonial.', {
						components: {
							shortcodeLink: <a href="https://support.wordpress.com/testimonials-shortcode/" />,
							code: <code />
						}
					} ) }

				</p>
				<FormLabel>
					<FormToggle
						checked={ this.isEnabled( 'jetpack-portfolio' ) }
						onChange={ this.boundTogglePortfolio }
						disabled={ this.isDisabled( 'jetpack-portfolio' ) }
						onClick={ recordEvent( 'Clicked Jetpack Portfolio CPT Checkbox' ) }>
						{ translate( 'Portfolio Projects' ) }
					</FormToggle>
				</FormLabel>
				{ this.hasDefaultPostTypeEnabled( 'jetpack-portfolio' ) && (
					<FormSettingExplanation>{ translate( 'Your theme supports Portfolio Projects' ) }</FormSettingExplanation>
				) }
				<p>
					{ translate( 'The Portfolio custom content type gives you an easy way to manage and showcase projects on your site. If your theme doesn’t support it yet, you can display the portfolio using the {{shortcodeLink}}portfolio shortcode{{/shortcodeLink}} ( {{code}}[portfolio]{{/code}} ) or with a link to the portfolio in the menu.', {
						components: {
							shortcodeLink: <a href="https://support.wordpress.com/portfolios/portfolio-shortcode/" />,
							code: <code />
						}
					} ) }
				</p>
			</FormFieldset>
		);
	}
}

CustomPostTypesFieldset.propTypes = {
	translate: PropTypes.func,
	siteId: PropTypes.number,
	requestingPostTypes: PropTypes.bool,
	requestingSettings: PropTypes.bool,
	value: PropTypes.object,
	recordEvent: PropTypes.func,
	className: PropTypes.string
};

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );

	return {
		siteId,
		requestingPostTypes: isRequestingPostTypes( state, siteId ),
		postTypes: getPostTypes( state, siteId )
	};
} )( localize( CustomPostTypesFieldset ) );
