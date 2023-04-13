import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import formatNumberCompact from 'calypso/lib/format-number-compact';
import '../style.scss';

class ReaderTagSidebar extends Component {
	static defaultProps = {
		sitesPerPage: 25,
	};

	static propTypes = {
		postCount: PropTypes.number,
		authorCount: PropTypes.number,
		sitesPerPage: PropTypes.number,
	};

	render() {
		const { postCount, authorCount, translate } = this.props;

		return (
			<>
				<div className="reader-tag-sidebar-totals">
					<ul>
						<li>
							<span className="reader-tag-sidebar__count">
								{ formatNumberCompact( postCount ) }
							</span>
							<span className="reader-tag-sidebar__title">{ translate( 'Posts' ) }</span>
						</li>
						<li>
							<span className="reader-tag-sidebar__count">
								{ formatNumberCompact( authorCount ) }
							</span>
							<span className="reader-tag-sidebar__title">{ translate( 'Authors' ) }</span>
						</li>
					</ul>
				</div>
				<div className="reader-tag-sidebar-related-tags">
					<h1>{ translate( 'Trending Tags' ) }</h1>
					<ul>
						<li>
							<a href="/tag/wordpress">WordPress</a>
						</li>
					</ul>
					<a href="/tags">{ translate( 'See all tags' ) }</a>
				</div>
				<div className="reader-tag-sidebar-related-sites">
					<h1>{ translate( 'Related Sites' ) }</h1>
					<ul>
						<li>
							<a href="/tag/wordpress">WordPress</a>
						</li>
					</ul>
				</div>
			</>
		);
	}
}

export default connect( () => {
	return {
		authorCount: 335000,
		postCount: 379000,
	};
} )( localize( ReaderTagSidebar ) );
