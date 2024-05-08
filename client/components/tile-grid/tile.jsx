import { Button, Card } from '@automattic/components';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';

export default class extends PureComponent {
	static propTypes = {
		buttonClassName: PropTypes.string,
		buttonLabel: PropTypes.string,
		className: PropTypes.string,
		description: PropTypes.string,
		highlighted: PropTypes.bool,
		href: PropTypes.string,
		image: PropTypes.string,
		onClick: PropTypes.func,
		e2eType: PropTypes.string,
	};

	render() {
		const {
			buttonClassName,
			buttonLabel,
			className,
			description,
			highlighted,
			href,
			image,
			onClick,
			e2eType,
		} = this.props;
		const tileClassName = clsx(
			'tile-grid__item',
			{
				'is-highlighted': highlighted,
			},
			className
		);

		return (
			<Card
				className={ tileClassName }
				href={ href }
				onClick={ onClick }
				tabIndex="-1"
				data-e2e-type={ e2eType }
			>
				{ image && (
					<div className="tile-grid__image">
						<img src={ image } />
					</div>
				) }
				<div className="tile-grid__item-copy">
					{ buttonLabel && (
						<Button
							className={ clsx( 'tile-grid__cta', buttonClassName ) }
							compact={ !! description }
						>
							{ buttonLabel }
						</Button>
					) }
					{ description && <p className="tile-grid__item-description">{ description }</p> }
				</div>
			</Card>
		);
	}
}
