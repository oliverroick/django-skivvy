'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _mixin = require('react-pure-render/mixin');

var _mixin2 = _interopRequireDefault(_mixin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var roundedToggleOptionType = _react2.default.PropTypes.shape({
  title: _react2.default.PropTypes.string,
  value: _react2.default.PropTypes.string
});

var RoundedToggle = _react2.default.createClass({
  displayName: 'RoundedToggle',

  mixins: [_mixin2.default],
  propTypes: {
    options: _react2.default.PropTypes.arrayOf(roundedToggleOptionType).isRequired,
    active: roundedToggleOptionType,
    short: _react2.default.PropTypes.bool,
    onChange: _react2.default.PropTypes.func.isRequired
  },
  render: function render() {
    var _this = this;

    var _props = this.props;
    var options = _props.options;
    var active = _props.active;

    return _react2.default.createElement(
      'div',
      { className: 'rounded-toggle inline short' },
      options.map(function (option) {
        return _react2.default.createElement(RoundedToggleOption, {
          key: option.value,
          option: option,
          short: _this.props.short,
          onClick: _this.props.onChange,
          className: 'strong ' + (option.value === active.value ? 'active' : '') });
      })
    );
  }
});

var RoundedToggleOption = _react2.default.createClass({
  displayName: 'RoundedToggleOption',

  mixins: [_mixin2.default],
  propTypes: {
    option: roundedToggleOptionType,
    className: _react2.default.PropTypes.string.isRequired,
    short: _react2.default.PropTypes.bool,
    onClick: _react2.default.PropTypes.func.isRequired
  },
  onClick: function onClick() {
    this.props.onClick(this.props.option);
  },
  render: function render() {
    var _props2 = this.props;
    var className = _props2.className;
    var option = _props2.option;

    return _react2.default.createElement(
      'a',
      {
        onClick: this.onClick,
        className: className },
      this.props.short ? option.short : option.title
    );
  }
});

module.exports = RoundedToggle;