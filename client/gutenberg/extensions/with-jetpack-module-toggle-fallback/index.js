/** @format */
/**
 * External dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { Component } from '@wordpress/element';
import { compose, createHigherOrderComponent } from '@wordpress/compose';
import { withDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import CompactFormToggle from 'components/forms/form-toggle/compact';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import Spinner from 'components/spinner';
import withJetpackModule from 'gutenberg/extensions/with-jetpack-module';

export default function withJetpackModuleToggleFallback( module ) {
	return compose(
		withJetpackModule( module ),
		withDispatch( ( dispatch, { jetpackModule } ) => {
			const canBeActivated = jetpackModule && ! jetpackModule.activated && jetpackModule.available;
			const activateModule = canBeActivated
				? () => dispatch( 'jetpack/modules' ).activateModule( jetpackModule.module )
				: () => {};
			return { activateModule };
		} ),
		createHigherOrderComponent( WrappedComponent => {
			return class extends Component {
				render() {
					const { jetpackModule, ...props } = this.props;

					if ( ! this.props.jetpackModule ) {
						return <Spinner />;
					}

					if ( ! this.props.jetpackModule.activated ) {
						return (
							<span className="jetpack-module-toggle">
								<CompactFormToggle
									toggling={ false }
									onChange={ this.props.activateModule }
									disabled={ ! this.props.activateModule }
								>
									{ sprintf( __( 'Enable %s to edit this block.' ), jetpackModule.name ) }
								</CompactFormToggle>
								{ jetpackModule.long_description && (
									<FormSettingExplanation isIndented>
										{ jetpackModule.long_description }
									</FormSettingExplanation>
								) }
							</span>
						);
					}

					return <WrappedComponent { ...props } />;
				}
			};
		}, 'withJetpackModuleToggleFallback' )
	);
}
