/**
 * External dependencies
 */
import React from 'react';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import PostSelector from 'my-sites/post-selector';
import FormFieldset from 'components/forms/form-fieldset';
import FormLegend from 'components/forms/form-legend';
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';

export default React.createClass( {
	propTypes: {
		isPageOnFront: React.PropTypes.bool,
		pageOnFrontId: React.PropTypes.number,
		pageForPostsId: React.PropTypes.number,
		onChange: React.PropTypes.func,
	},

	getDefaultProps() {
		return {
			isPageOnFront: false,
			onChange: noop,
		};
	},

	getInitialState() {
		return {
			isPageOnFront: this.props.isPageOnFront,
			pageOnFrontId: this.props.pageOnFrontId,
		};
	},

	handleChangeIsPageOnFront( event ) {
		const isPageOnFront = event.target.value === 'page';
		this.setState( { isPageOnFront } );
		this.props.onChange( { isPageOnFront } );
	},

	handleChangePageOnFront( post ) {
		this.setState( { isPageOnFront: true, pageOnFrontId: post.ID } );
		this.props.onChange( { isPageOnFront: true, pageOnFrontId: post.ID } );
	},

	render() {
		return (
			<Card compact className="home-page-settings">
				<FormFieldset>
					<FormLegend>{ this.translate( 'Your home page displays:' ) }</FormLegend>
					<FormLabel>
						<FormRadio value="blog" checked={ ! this.state.isPageOnFront } onChange={ this.handleChangeIsPageOnFront } />
						<span>{ this.translate( 'A list of your latest posts' ) }</span>
					</FormLabel>

					<FormLabel>
						<FormRadio value="page" checked={ this.state.isPageOnFront } onChange={ this.handleChangeIsPageOnFront } />
						<span>{ this.translate( 'A page from this list:' ) }</span>
							<PostSelector
								siteId={ this.props.site.ID }
								type="page"
								status="publish"
								orderBy="date"
								order="DESC"
								selected={ this.state.pageOnFrontId }
								onChange={ this.handleChangePageOnFront } />
					</FormLabel>
				</FormFieldset>
			</Card>
		);
	}
} );
