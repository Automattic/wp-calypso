/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { map } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import PreviewCardAction from 'components/preview-card/preview-card-action';
import PreviewCardHeader from 'components/preview-card/preview-card-header';
import PreviewCardHeaderElement from 'components/preview-card/preview-card-header-element';

export class PreviewCard extends Component {
	static propTypes = {
		actions: PropTypes.arrayOf( PropTypes.object ),
		className: PropTypes.string,
		header: PropTypes.element.isRequired,
		isExpanded: PropTypes.bool,
		toggleExpanded: PropTypes.func,
	};

	static defaultProps = {
		isExpanded: false,
	};

	render() {
		const {
			actions,
			className,
			children,
			header,
			isExpanded,
			toggleExpanded,
		} = this.props;

		const classes = classNames( 'preview-card', className, { 'is-expanded': isExpanded } );

		return (
			<Card is-compact className={ classes }>
				{ isExpanded &&
					<PreviewCardHeader className="preview-card__actions">
						<PreviewCardHeaderElement>
							<PreviewCardAction icon="cross" onClick={ toggleExpanded } />
						</PreviewCardHeaderElement>
						<PreviewCardHeaderElement>
							{ map( actions, ( action, index ) =>
								<PreviewCardAction { ...action } key={ index } />
							) }
						</PreviewCardHeaderElement>
					</PreviewCardHeader>
				}

				{ ! isExpanded && header }

				{ isExpanded && children }
			</Card>
		);
	}
}

export default PreviewCard;
