import { Button, Gridicon } from '@automattic/components';
import i18n from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import { Component } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import { CALYPSO_CONTACT } from 'calypso/lib/url/support';
import './style.scss';

class LoadingPlaceholderCancelPurchasePage extends Component {
	static propTypes = {
		path: PropTypes.string,
		title: PropTypes.string.isRequired,
		isFullWidth: PropTypes.bool.isRequired,
	};

	goBack = () => {
		page.back( this.props.path || '/' );
	};

	supportLink = () => {
		return i18n.translate(
			'Have a question? {{contactLink}}Ask a Happiness Engineer!{{/contactLink}}',
			{
				components: {
					contactLink: <a href={ CALYPSO_CONTACT } />,
				},
			}
		);
	};

	render() {
		return (
			<Main wideLayout={ this.props.isFullWidth } className="loading-placeholder">
				<Button compact borderless className="cancel-purchase__back-link" onClick={ this.goBack }>
					<Gridicon icon="chevron-left" size={ 18 } />
					{ i18n.translate( 'Back' ) }
				</Button>

				<FormattedHeader brandFont headerText={ this.props.title } align="left" />

				<div className="cancel-purchase__layout">
					<div className="cancel-purchase__layout-col cancel-purchase__layout-col-left">
						<div className="loading-placeholder__content cancel-purchase-loading-placeholder__site" />
						{ this.props.children }
					</div>
					<div className="cancel-purchase__layout-col cancel-purchase__layout-col-right">
						<div className="loading-placeholder__content cancel-purchase-loading-placeholder__site" />

						<p className="cancel-purchase--support-link cancel-purchase--support-link--sidebar">
							{ this.supportLink() }
						</p>
					</div>
				</div>
			</Main>
		);
	}
}

export default LoadingPlaceholderCancelPurchasePage;
