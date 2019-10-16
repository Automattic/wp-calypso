/**
 * External dependencies
 */
import React from 'react';
import styled from 'styled-components';

/**
 * Internal dependencies
 */
import Button from './Button';

// TODO: fix all these interpolations to be declarative
// TODO: convert components here to functional Components

const Label = styled.label`
	display: block;
	color: ${props => props.color};
	font-weight: 700;
	font-size: 14px;
	margin-bottom: 8px;
`;

const Input = styled.input`
	display: block;
	width: 100%;
	box-sizing: border-box;
	font-size: 16px;
	border: 1px solid ${props => props.theme.colors.gray20};
	padding: 12px ${props => ( props.icon ? '40px' : '10px' )} 12px 10px;

	::-webkit-inner-spin-button,
	::-webkit-outer-spin-button {
		-webkit-appearance: none;
	}

	[type='number'],
	[type='number'] {
		-moz-appearance: none;
		appearance: none;
	}
`;

const InputWrapper = styled.div`
	position: relative;
`;

const FieldIcon = styled.div`
	position: absolute;
	top: 50%;
	transform: translateY( -50% );
	right: 10px;
`;

const ButtonIconUI = styled.div`
	position: absolute;
	top: 0;
	right: 0;

	button {
		border: 1px solid transparent;
		box-shadow: none;
	}

	button:hover {
		background: none;
		border: 1px solid transparent;
		box-shadow: none;

		filter: brightness( 0 ) saturate( 100% ) invert( 35% ) sepia( 22% ) saturate( 3465% )
			hue-rotate( 300deg ) brightness( 88% ) contrast( 98% );
	}
`;

const Description = styled.p`
	margin: 8px 0 0 0;
	color: ${props => props.color};
	font-style: italic;
	font-size: 14px;
`;

export default class Field extends React.Component {
	renderIcon = () => {
		if ( ! this.props.isIconVisible ) {
			return null;
		}

		if ( this.props.iconAction ) {
			return (
				<ButtonIconUI>
					<Button onClick={ this.props.iconAction } label={ this.props.icon } />
				</ButtonIconUI>
			);
		}

		if ( this.props.icon ) {
			return <FieldIcon>{ this.props.icon }</FieldIcon>;
		}

		return null;
	};

	fieldOnChange = e => {
		if ( this.props.onChange ) {
			this.props.onChange( e.target );
		}

		return null;
	};

	onBlurField = () => {
		return null;
	};

	renderDescription = () => {
		if ( this.props.description || this.props.error ) {
			return (
				<Description color={ this.props.error ? colours.red50 : colours.gray50 }>
					{ this.props.error ? this.props.errorMessage : this.props.description }
				</Description>
			);
		}

		return null;
	};

	render() {
		return (
			<div className={ this.props.className }>
				<Label
					htmlFor={ this.props.value }
					color={ this.props.error ? colours.red50 : colours.gray80 }
				>
					{ this.props.label }
				</Label>
				<InputWrapper>
					<Input
						id={ this.props.id }
						icon={ this.props.icon }
						value={ this.props.value }
						type={ this.props.type }
						onChange={ this.fieldOnChange }
						onBlur={ this.onBlurField }
						placeholder={ this.props.placeholder }
						tabIndex={ this.props.tabIndex }
					/>
					{ this.renderIcon() }
				</InputWrapper>
				{ this.renderDescription() }
			</div>
		);
	}
}
