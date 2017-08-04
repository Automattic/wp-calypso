import React from 'react';

import { translate } from 'i18n-calypso';
import Card from 'components/card';
import Button from 'components/button';

import BlogGraphic from './blog-graphic';
import WebsiteGraphic from './website-graphic';
import PortfolioGraphic from './portfolio-graphic';
import StoreGraphic from './store-graphic';

module.exports = React.createClass( {

	displayName: 'SelectGenre',

	propTypes: {
		required: React.PropTypes.bool,
	},

	render: function() {
		if ( ! this.props.current ) {
			return ( <div /> );
		}

		return ( 

			<div className="jpo__site-type-wrapper">
				<div className="jpo__site-type-row">
					<div className="card design-type-with-store__choice">
						<a className="design-type-with-store__choice-link:after" href="#"
						onClick={ this.props.onSelectBlog }>
						<div className="design-type-with-store__image">
						<BlogGraphic />
						</div>
						<div className="design-type-with-store__choice-copy">
						<span className="button is-compact design-type-with-store__cta"
						onClick={ this.props.onSelectBlog }>{
							translate( 'Start with a blog' ) }</span>
						<p className="jpo__site-type-description">{
							translate( 'To share your ideas, stories, and photographs with your followers.' ) }</p>
						</div>
						</a>
					</div>
					<div className="card design-type-with-store__choice">
						<a className="design-type-with-store__choice-link:after" href="#"
						onClick={ this.props.onSelectWebsite }>
						<div className="design-type-with-store__image">
						<WebsiteGraphic />
						</div>
						<div className="design-type-with-store__choice-copy">
						<span className="button is-compact design-type-with-store__cta"
						onClick={ this.props.onSelectWebsite }>{
							translate( 'Start with a website' ) }</span>
						<p className="jpo__site-type-description">{
							translate( 'To promote your business, organization, or brand and connect with your audience.' ) }</p>
						</div>
						</a>
					</div>
					<div className="card design-type-with-store__choice">
						<a className="design-type-with-store__choice-link:after" href="#"
						onClick={ this.props.onSelectWebsite }>
						<div className="design-type-with-store__image">
						<PortfolioGraphic />
						</div>
						<div className="design-type-with-store__choice-copy">
						<span className="button is-compact design-type-with-store__cta"
						onClick={ this.props.onSelectPortfolio }>{ translate( 'Start with a portfolio' ) }</span>
						<p className="jpo__site-type-description">{
							translate( 'To present your creative projects in a visual showcase.' ) }</p>
						</div>
						</a>
					</div>
					<div className="card design-type-with-store__choice">
						<a className="design-type-with-store__choice-link:after" href="#"
						onClick={ this.props.onSelectWebsite }>
						<div className="design-type-with-store__image">
						<StoreGraphic />
						</div>
						<div className="design-type-with-store__choice-copy">
						<span className="button is-compact design-type-with-store__cta"
						onClick={ this.props.onSelectStore }>{ translate( 'Start with an online store' ) }</span>
						<p className="jpo__site-type-description">{
							translate( 'To sell your products or services and accept payments.' ) }</p>
						</div>
						</a>
					</div>
				</div>
				<div className="jpo__site-type-note">{ translate( 'Not sure? Pick the closest option. You can always change your settings later.' ) }</div>
			</div>
		);
	}

} );