/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'state/analytics/actions';
import CompactCard from 'components/card/compact';

class GoogleMyBusinessConfirm extends Component {
	static propTypes = {
		recordTracksEvent: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	render() {
		const { translate } = this.props;

		return (
			<div className="google-my-business-confirm">
				<CompactCard>
					<h2>{ translate( 'Verify your connection to this business' ) }</h2>
					<p>
						{ translate(
							"Let's confirm that you're authorized to manage " +
								"this business listing. Once verified, you'll be able to make " +
								'the most of your listing on Google.'
						) }
					</p>

					<ul className="google-my-business-confirm__list">
						<li>
							<Gridicon icon="checkmark-circle" size={ 18 } />
							{ translate( 'Get your business found on Google Search & Maps' ) }
						</li>
						<li>
							<Gridicon icon="checkmark-circle" size={ 18 } />
							{ translate( 'Respond to customer reviews' ) }
						</li>
						<li>
							<Gridicon icon="checkmark-circle" size={ 18 } />
							{ translate( 'Create promotional posts and upload photos' ) }
						</li>
						<li>
							<Gridicon icon="checkmark-circle" size={ 18 } />
							{ translate( 'Track business analytics' ) }
						</li>
					</ul>
				</CompactCard>
			</div>
		);
	}
}

export default connect( undefined, { recordTracksEvent } )( localize( GoogleMyBusinessConfirm ) );
