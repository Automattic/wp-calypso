/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import PostSelector from 'my-sites/post-selector';
import FormFieldset from 'components/forms/form-fieldset';
import FormLegend from 'components/forms/form-legend';
import FormLabel from 'components/forms/form-label';

const HomepageSettings = React.createClass( {
	propTypes: {
		pages: React.PropTypes.array.isRequired,
		site: React.PropTypes.object.isRequired,
		isPageOnFront: React.PropTypes.bool,
		pageOnFrontId: React.PropTypes.number,
		pageForPostsId: React.PropTypes.number,
		onChange: React.PropTypes.func.isRequired,
		requestSitePosts: React.PropTypes.func.isRequired,
		createHomepage: React.PropTypes.func.isRequired,
	},

	getInitialState() {
		return this.getStateForProps( this.props );
	},

	componentWillMount() {
		this.props.requestSitePosts( this.props.site.ID, { type: 'page' } );
	},

	componentWillReceiveProps( nextProps ) {
		this.setState( this.getStateForProps( nextProps ) );
	},

	getStateForProps( props ) {
		return {
			isPageOnFront: props.isPageOnFront,
			pageOnFrontId: props.pageOnFrontId,
		};
	},

	createHomepage() {
		this.props.createHomepage();
	},

	getDefaultPageId() {
		const homePages = this.props.pages.filter( page => page.title === 'Home' );
		if ( homePages.length > 0 ) {
			return homePages[ 0 ].ID;
		}
		return null;
	},

	handleChangeIsPageOnFront( isPageOnFront ) {
		let pageOnFrontId = this.state.pageOnFrontId;
		if ( isPageOnFront && ! pageOnFrontId ) {
			pageOnFrontId = this.getDefaultPageId();
			if ( ! pageOnFrontId ) {
				this.createHomepage();
			}
		}
		this.setState( { isPageOnFront, pageOnFrontId } );
		this.props.onChange( { isPageOnFront, pageOnFrontId } );
	},

	handleChangePageOnFront( post ) {
		this.setState( { isPageOnFront: true, pageOnFrontId: post.ID } );
		this.props.onChange( { isPageOnFront: true, pageOnFrontId: post.ID } );
	},

	handleSetPageOnFront() {
		this.handleChangeIsPageOnFront( true );
	},

	handleSetBlogOnFront() {
		this.handleChangeIsPageOnFront( false );
	},

	renderPostSelector() {
		if ( ! this.state.isPageOnFront ) {
			return '';
		}
		if ( ! this.state.pageOnFrontId ) {
			// Placeholder while a default home page is created
			return (
				<Card compact className="home-page-settings__post-selector">
					<div className="home-page-settings__post-selector__header">{ this.translate( 'Your home page:' ) }</div>
					<span>{ this.translate( 'Home' ) }</span>
				</Card>
			);
		}
		return (
			<Card compact className="home-page-settings__post-selector">
				<div className="home-page-settings__post-selector__header">{ this.translate( 'Your home page:' ) }</div>
				<PostSelector
					siteId={ this.props.site.ID }
					type="page"
					status="publish"
					orderBy="date"
					order="DESC"
					selected={ this.state.pageOnFrontId }
					onChange={ this.handleChangePageOnFront }
				/>
			</Card>
		);
	},

	render() {
		const blogButtonClassNames = classNames( 'radio-button-card', {
			'is-selected': ! this.state.isPageOnFront
		} );
		const pageButtonClassNames = classNames( 'radio-button-card', {
			'is-selected': this.state.isPageOnFront
		} );
		return (
			<FormFieldset>
				<FormLegend>{ this.translate( 'Your home page displays:' ) }</FormLegend>
				<FormLabel>
					<Card compact className={ blogButtonClassNames } onClick={ this.handleSetBlogOnFront } >
						<span className="radio-button-card__header">{ this.translate( 'Latest Posts' ) }</span>
						<span className="radio-button-card__body">{ this.translate( 'A list of your latest posts, displayed newest to oldest.' ) }</span>
					</Card>
				</FormLabel>
				<FormLabel>
					<Card compact className={ pageButtonClassNames } onClick={ this.handleSetPageOnFront } >
						<span className="radio-button-card__header">{ this.translate( 'A Page' ) }</span>
						<span className="radio-button-card__body">{ this.translate( 'An editable home page for your website.' ) }</span>
					</Card>
					{ this.renderPostSelector() }
				</FormLabel>
			</FormFieldset>
		);
	}
} );

export default HomepageSettings;
