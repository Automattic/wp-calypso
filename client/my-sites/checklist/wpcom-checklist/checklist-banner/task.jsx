/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';

class ChecklistBannerTask extends PureComponent {
	static propTypes = {
		bannerImageSrc: PropTypes.string,
		buttonText: PropTypes.node,
		completed: PropTypes.bool,
		description: PropTypes.node,
		onClick: PropTypes.func,
		siteSlug: PropTypes.string,
		title: PropTypes.node.isRequired,
		translate: PropTypes.func.isRequired,
		trackTaskDisplay: PropTypes.func,
	};

	static defaultProps = {
		trackTaskDisplay: () => {},
	};

	componentDidMount() {
		this.props.trackTaskDisplay( this.props.id, this.props.completed, 'banner' );
	}

	render() {
		// Banners never render completed Tasks
		if ( this.props.completed ) {
			return null;
		}

		const { bannerImageSrc, description, onClick, siteSlug, title, translate } = this.props;
		const { buttonText = translate( 'Do it!' ) } = this.props;

		return (
			<>
				<div className="checklist-banner__content">
					<h3 className="checklist-banner__title">{ title }</h3>
					<p className="checklist-banner__description">{ description }</p>
					<div className="checklist-banner__actions">
						{ onClick && (
							<Button onClick={ onClick } className="checklist-banner__button" primary>
								{ buttonText }
							</Button>
						) }
						{ this.props.children ||
							( siteSlug && (
								<a href={ `/checklist/${ siteSlug }` } className="checklist-banner__link">
									{ this.props.translate( 'View your checklist' ) }
								</a>
							) ) }
					</div>
				</div>
				{ bannerImageSrc && (
					<img
						alt=""
						aria-hidden="true"
						className="checklist-banner__image"
						src={ this.props.bannerImageSrc }
					/>
				) }
			</>
		);
	}
}

export default localize( ChecklistBannerTask );
