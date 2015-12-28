/**
* External dependencies
*/
import React from 'react';
import classNames from 'classnames';
import hasOwn from 'lodash/object/has';

/**
* Interal dependencies
*/
import Gridicon from 'components/gridicon';

module.exports = React.createClass( {

  displayName: 'Checkbox',

  propTypes: {
    onChange : React.PropTypes.func,
    checked: React.PropTypes.any
  },

  getDefaultProps() {
    return {
      checked: false,
      disabled: false
    };
  },

  getInitialState() {
    const props = this.props;
    const checked = hasOwn(props, 'checked') ? props.checked : false;
    return {
      checked: checked
    }
  },

  isChecked() {
    return this.state.checked;
  },

  getFocusedCss() {
    return this.state.focused ? 'is-focused' : '';
  },

  getDisabledCss() {
    const props = this.props;
    const disabled = hasOwn(props, 'disabled') ? props.disabled : false;
    return disabled === true ? 'is-disabled' : '';
  },

  renderMark() {
    if ( this.isChecked() ) {
      return <Gridicon icon="checkmark" size={ 18 } />;
    }
  },

  handleChange(e) {
    const checked = e.target.checked;
    const props = this.props;

    this.setState({
      checked: checked
    })

    props.onChange && props.onChange(e, this.state.checked);
  },

  handleFocus() {
    this.setState({
      focused: true
    })
  },

  handleBlur() {
    this.setState({
      focused: false
    })
  },

  render() {
    const focusCssClass = this.getFocusedCss();
    const disabledCssClass = this.getDisabledCss();

    return (
      <label className={ classNames( this.props.className, 'checkbox', focusCssClass, disabledCssClass ) } >
        <input type="checkbox"
          checked = { this.isChecked() }
          disabled = { this.props.disabled }
          onChange = { this.handleChange }
          onFocus = { this.handleFocus }
          onBlur = { this.handleBlur } />
        { this.props.children }
        { this.renderMark() }
      </label>
    );
  }
} );
