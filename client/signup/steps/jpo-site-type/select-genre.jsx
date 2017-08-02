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
					<Card>
						<BlogGraphic />
						<hr />
						<Button onClick={ this.props.onSelectBlog }>{ translate( 'Start with a blog' ) }</Button>
						<div className="jpo__site-type-description">{ translate( 'To share your ideas, stories, and photographs with your followers.' ) }</div>
					</Card>
					<Card>
						<WebsiteGraphic />
						<hr />
						<Button onClick={ this.props.onSelectWebsite }>{ translate( 'Start with a website' ) }</Button>
						<div className="jpo__site-type-description">{ translate( 'To promote your business, organization, or brand and connect with your audience.' ) }</div>
					</Card>
				</div>
				<div className="jpo__site-type-row">
					<Card>
						<PortfolioGraphic />
						<hr />
						<Button onClick={ this.props.onSelectPortfolio }>{ translate( 'Start with a portfolio' ) }</Button>
						<div className="jpo__site-type-description">{ translate( 'To present your creative projects in a visual showcase.' ) }</div>
					</Card>
					<Card>
						<StoreGraphic />
						<hr />
						<Button onClick={ this.props.onSelectStore }>{ translate( 'Start with an online store' ) }</Button>
						<div className="jpo__site-type-description">{ translate( 'To sell your products or services and accept payments.' ) }</div>
					</Card>
				</div>
				<div className="jpo__site-type-note">{ translate( 'Not sure? Pick the closest option. You can always change your settings later.' ) }</div>
			</div>
		);
	}

} );