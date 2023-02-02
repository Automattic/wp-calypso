import { Button, Card } from '@automattic/components';
import { Component } from 'react';

import './style.scss';

class FeatureIncludedCard extends Component {
	render() {
		const { illustration, title, text, showButton, buttonText, buttonClick } = this.props;

		return (
			<Card className="feature-included-card__card">
				<img className="feature-included-card__illustration" alt={ title } src={ illustration } />
				<div className="feature-included-card__content">
					<p className="feature-included-card__title">{ title }</p>
					<p className="feature-included-card__text">{ text }</p>
					{ showButton ? (
						<Button className="feature-included-card__link" onClick={ buttonClick }>
							{ buttonText }
						</Button>
					) : null }
				</div>
			</Card>
		);
	}
}

export default FeatureIncludedCard;
