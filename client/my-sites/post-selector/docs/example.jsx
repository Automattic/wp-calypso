/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import PostSelector from '../';
import FormLabel from 'components/forms/form-label';
import { getPrimarySiteId } from 'state/selectors';

class PostSelectorExample extends Component {
	state = {
		showTypeLabels: true,
		selectedPostId: null,
	};

	setSelected = ( post ) => {
		this.setState( {
			selectedPostId: post.ID,
		} );
	};

	render() {
		const { primarySiteId } = this.props;

		return (
			<div style={ { width: 300 } }>
				<FormLabel>
					<input
						type="checkbox"
						checked={ this.state.showTypeLabels }
						onChange={ () => this.setState( { showTypeLabels: ! this.state.showTypeLabels } ) } />
					<span>Show Type Labels</span>
				</FormLabel>
				<PostSelector
					siteId={ primarySiteId ? primarySiteId : 3584907 }
					type="any"
					orderBy="date"
					order="DESC"
					showTypeLabels={ this.state.showTypeLabels }
					selected={ this.state.selectedPostId }
					onChange={ this.setSelected }
				/>
			</div>
		);
	}
}

export default connect(
	( state ) => ( {
		primarySiteId: getPrimarySiteId( state ),
	} )
)( PostSelectorExample );
