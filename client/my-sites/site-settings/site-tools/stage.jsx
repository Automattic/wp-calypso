/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import CompactCard from 'components/card/compact';
import { requestStage } from 'state/stage/actions';

class Stage extends Component {
	onClick = () => this.props.requestStage( this.props.siteId );

	render() {
		const { translate } = this.props;

		return (
			<CompactCard>
				<p className="site-tools__section-title">{ translate( 'Staging Site' ) }</p>
				<p className="site-tools__section-desc">
					{ translate( 'An instant clone of your site for testing.' ) }
				</p>
				<Button primary onClick={ this.onClick }>
					Create
				</Button>
			</CompactCard>
		);
	}
}

export default connect(
	null,
	{ requestStage }
)( localize( Stage ) );
