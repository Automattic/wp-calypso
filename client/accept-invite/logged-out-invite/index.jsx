/**
 * External dependencies
 */
import React from 'react'

/**
 * Internal dependencies
 */
import SignupForm from './signup-form'

export default class LoggedOutInvite extends React.Component {
	render() {
		return <SignupForm { ...this.props } />
	}
}
