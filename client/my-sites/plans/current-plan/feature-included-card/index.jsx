import { Button, Card } from '@automattic/components';
import { Component } from 'react';

import './style.scss';

class FeatureIncludedCard extends Component {
	render() {
		const { illustration, title, text, showButton, buttonText, buttonClick } = this.props;

		return (
			<Card className="feature-included-card__card">
				<img
					className="feature-included-card__included-illustration"
					alt={ title }
					src={ illustration }
				/>
				<p className="feature-included-card__included-title">{ title }</p>
				<p className="feature-included-card__included-text">{ text }</p>
				{ showButton ? (
					<Button className="feature-included-card__included-link" onClick={ buttonClick }>
						{ buttonText }
					</Button>
				) : null }
			</Card>
		);
	}
}

export default FeatureIncludedCard;
