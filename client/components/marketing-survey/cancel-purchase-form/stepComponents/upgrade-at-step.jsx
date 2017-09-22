/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import FormFieldset from 'components/forms/form-fieldset';
import FormSectionHeading from 'components/forms/form-section-heading';
import { recordTracksEvent } from 'state/analytics/actions';
import { getSelectedSite } from 'state/ui/selectors';

export class UpgradeATStep extends Component {
	static propTypes = {
		recordTracksEvent: PropTypes.func.isRequired,
		selectedSite: PropTypes.object.isRequired,
		translate: PropTypes.func.isRequired,
	}

	static defaultProps = {
		translate: noop,
	}

	onClick = () => {
		this.props.recordTracksEvent( 'calypso_cancellation_upgrade_at_step_upgrade_click' );
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
					<Button primary href={ href } onClick={ this.onClick }>
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
const mapDispatchToProps = { recordTracksEvent };

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)( localize( UpgradeATStep ) );
