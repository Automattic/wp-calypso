/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import PostSelector from '../';
import observe from 'lib/mixins/data-observe';
import sites from 'lib/sites-list';
import FormLabel from 'components/forms/form-label';

const PostSelectorExample = React.createClass( {
	mixins: [ observe( 'sites' ), PureRenderMixin ],

	getInitialState() {
		return {
			showTypeLabels: true
		};
	},

	render() {
		const primary = this.props.sites.getPrimary();

		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/blocks/post-selector">Post Selector</a>
				</h2>
				<div style={ { width: 300 } }>
					<FormLabel>
						<input
							type="checkbox"
							checked={ this.state.showTypeLabels }
							onChange={ () => this.setState( { showTypeLabels: ! this.state.showTypeLabels } ) } />
						<span>Show Type Labels</span>
					</FormLabel>
					{ this.props.sites.initialized && (
						<PostSelector
							siteId={ primary ? primary.ID : 3584907 }
							type="any"
							orderBy="date"
							order="DESC"
							showTypeLabels={ this.state.showTypeLabels } />
					) }
				</div>
			</div>
		);
	}
} );

export default React.createClass( {
	displayName: 'PostSelector',

	mixins: [ PureRenderMixin ],

	render() {
		return <PostSelectorExample sites={ sites() } />;
	}
} );
