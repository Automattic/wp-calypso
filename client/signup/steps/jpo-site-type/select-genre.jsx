/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'i18n-calypso';
import get from 'lodash/get';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Button from 'components/button';
import BlogGraphic from './blog-graphic';
import WebsiteGraphic from './website-graphic';
import PortfolioGraphic from './portfolio-graphic';
import StoreGraphic from './store-graphic';

class SelectGenre extends React.Component {

	static propTypes = {
		signupDependencies: PropTypes.object,
		required: PropTypes.bool
	};

	render() {
		if ( ! this.props.current ) {
			return ( <div /> );
		}

		return (
			<div className="jpo-site-type__choices">
				<Card className={ classNames( 'jpo-site-type__choice', {
					'is-selected': 'blog' === get( this.props.signupDependencies, [ 'jpoSiteType', 'genre' ], '' )
				} ) }>
					<a className="jpo-site-type__choice-link" href="#" onClick={ this.props.onSelectBlog }>
						<div className="jpo-site-type__image">
							<BlogGraphic />
						</div>
						<div className="jpo-site-type__choice-copy">
							<Button className="jpo-site-type__cta" onClick={ this.props.onSelectBlog }>
								{ translate( 'Start with a blog' ) }
							</Button>
							<p className="jpo-site-type__description">
								{ translate( 'To share your ideas, stories, and photographs with your followers.' ) }
							</p>
						</div>
					</a>
				</Card>
				<Card className={ classNames( 'jpo-site-type__choice', {
					'is-selected': 'website' === get( this.props.signupDependencies, [ 'jpoSiteType', 'genre' ], '' )
				} ) }>
					<a className="jpo-site-type__choice-link" href="#" onClick={ this.props.onSelectWebsite }>
						<div className="jpo-site-type__image">
							<WebsiteGraphic />
						</div>
						<div className="jpo-site-type__choice-copy">
							<Button className="jpo-site-type__cta" onClick={ this.props.onSelectWebsite }>
								{ translate( 'Start with a website' ) }
							</Button>
							<p className="jpo-site-type__description">
								{ translate( 'To promote your business, organization, or brand and connect with your audience.' ) }
							</p>
						</div>
					</a>
				</Card>
				<Card className={ classNames( 'jpo-site-type__choice', {
					'is-selected': 'portfolio' === get( this.props.signupDependencies, [ 'jpoSiteType', 'genre' ], '' )
				} ) }>
					<a className="jpo-site-type__choice-link" href="#" onClick={ this.props.onSelectPortfolio }>
						<div className="jpo-site-type__image">
							<PortfolioGraphic />
						</div>
						<div className="jpo-site-type__choice-copy">
							<Button className="jpo-site-type__cta" onClick={ this.props.onSelectPortfolio }>
								{ translate( 'Start with a portfolio' ) }
							</Button>
							<p className="jpo-site-type__description">
								{ translate( 'To present your creative projects in a visual showcase.' ) }
							</p>
						</div>
					</a>
				</Card>
				<Card className={ classNames( 'jpo-site-type__choice', {
					'is-selected': 'store' === get( this.props.signupDependencies, [ 'jpoSiteType', 'genre' ], '' )
				} ) }>
					<a className="jpo-site-type__choice-link" href="#" onClick={ this.props.onSelectStore }>
						<div className="jpo-site-type__image">
							<StoreGraphic />
						</div>
						<div className="jpo-site-type__choice-copy">
							<Button className="jpo-site-type__cta" onClick={ this.props.onSelectStore }>
								{ translate( 'Start with an online store' ) }
							</Button>
							<p className="jpo-site-type__description">
								{ translate( 'To sell your products or services and accept payments.' ) }
							</p>
						</div>
					</a>
				</Card>
				<span className="jpo-site-type__note">
					{ translate( 'Not sure? Pick the closest option. You can always change your settings later.' ) }
				</span>
			</div>
		);
	}

}

export default SelectGenre;
