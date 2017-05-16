/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSite } from 'state/ui/selectors';
import FormSectionHeading from 'components/forms/form-section-heading';
import FormFieldset from 'components/forms/form-fieldset';
import Button from 'components/button';

export class UpgradeATStep extends Component {
	static propTypes = {
		translate: PropTypes.func.isRequired,
		selectedSite: PropTypes.object.isRequired,
	}

	static defaultProps = {
		translate: noop,
	}

	render() {
		const { translate, selectedSite } = this.props;
		const href = `/checkout/${ selectedSite.slug }/business`;

		return (
			<div>
				<FormSectionHeading>
					{ translate( 'New! Install Custom Plugins and Themes' ) }
				</FormSectionHeading>
				<FormFieldset>
					<p>
						{
							translate(
								'Did you know that you can now use third-party plugins and themes on the WordPress.com Business plan? ' +
								'Claim a 25% discount when you upgrade your site today - {{b}}enter the code BIZC25 at checkout{{/b}}.',
								{
									components: {
										b: <strong />
									}
								}
							)
						}
					</p>
					<Button primary href={ href }>
						{ translate( 'Upgrade My Site' ) }
					</Button>
				</FormFieldset>
			</div>
		);
	}
}

const mapStateToProps = ( state ) => ( {
	selectedSite: getSelectedSite( state )
} );
const mapDispatchToProps = null;

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)( localize( UpgradeATStep ) );
