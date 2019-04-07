/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import CompactCard from 'components/card/compact';

/**
 *
 * Style dependencies
 */
import './style.scss';

class DomainsLandingContentCard extends Component {
	static propTypes = {
		illustration: PropTypes.string,
		title: PropTypes.oneOfType( [ PropTypes.string, PropTypes.node ] ).isRequired,
		message: PropTypes.oneOfType( [ PropTypes.string, PropTypes.node ] ),
		actionTitle: PropTypes.oneOfType( [ PropTypes.string, PropTypes.node ] ),
		actionCallback: PropTypes.func,
		footer: PropTypes.oneOfType( [ PropTypes.string, PropTypes.node ] ),
		isLoading: PropTypes.bool,
	};

	static defaultProps = {
		isLoading: false,
	};

	renderPlaceholder = () => {
		const { title } = this.props;

		return (
			<CompactCard className="content-card content-card__loading-placeholder">
				<div className="content-card__illustration">loading</div>
				<h2 className="content-card__title">{ title }</h2>
				<h3 className="content-card__message">loading</h3>
				<h3 className="content-card__message">loading</h3>
				<p className="content-card__footer">loading</p>
			</CompactCard>
		);
	};

	render() {
		const {
			illustration,
			title,
			message,
			actionTitle,
			actionCallback,
			footer,
			isLoading,
		} = this.props;

		if ( isLoading ) {
			return this.renderPlaceholder();
		}

		return (
			<CompactCard className="content-card">
				{ illustration && <img src={ illustration } alt="" /> }
				{ <h2 className="content-card__title">{ title }</h2> }
				{ message && <h3 className="content-card__message">{ message }</h3> }
				{ actionTitle && (
					<Button className="content-card__action-button" primary onClick={ actionCallback }>
						{ actionTitle }
					</Button>
				) }
				{ footer && <p className="content-card__footer">{ footer }</p> }
			</CompactCard>
		);
	}
}

export default DomainsLandingContentCard;
