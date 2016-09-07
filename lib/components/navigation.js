'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _mixin = require('react-pure-render/mixin');

var _mixin2 = _interopRequireDefault(_mixin);

var _navigation_item = require('./navigation_item');

var _navigation_item2 = _interopRequireDefault(_navigation_item);

var _custom = require('../custom');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getAllInSectionFromChild(headings, idx) {
  for (var i = idx; i > 0; i--) {
    if (headings[i].depth === 2) {
      return getAllInSection(headings, i);
    }
  }
}

function getAllInSection(headings, idx) {
  var activeHeadings = [];
  for (var i = idx + 1; i < headings.length; i++) {
    if (headings[i].depth === 3) {
      activeHeadings.push(headings[i].children[0].value);
    } else if (headings[i].depth === 2) {
      break;
    }
  }
  return activeHeadings;
}

var Navigation = _react2.default.createClass({
  displayName: 'Navigation',

  mixins: [_mixin2.default],
  propTypes: {
    ast: _react2.default.PropTypes.object.isRequired,
    activeSection: _react2.default.PropTypes.string,
    navigationItemClicked: _react2.default.PropTypes.func.isRequired
  },
  render: function render() {
    var _this = this;

    var activeHeadings = [];
    var headings = this.props.ast.children.filter(function (child) {
      return child.type === 'heading';
    });

    if (this.props.activeSection) {

      var activeHeadingIdx = headings.findIndex(function (heading) {
        return heading.children[0].value === _this.props.activeSection;
      });
      var activeHeading = headings[activeHeadingIdx];

      if (activeHeading.depth === 3) {
        activeHeadings = [this.props.activeSection].concat(getAllInSectionFromChild(headings, activeHeadingIdx));
      }

      // this could potentially have children, try to find them
      if (activeHeading.depth === 2) {
        activeHeadings = [this.props.activeSection].concat(getAllInSection(headings, activeHeadingIdx));
      }
    }

    activeHeadings = activeHeadings.reduce(function (memo, heading) {
      memo[heading] = true;
      return memo;
    }, {});

    return _react2.default.createElement(
      'div',
      { className: 'pad0x small' },
      headings.map(function (child, i) {
        var sectionName = child.children[0].value;
        var active = sectionName === _this.props.activeSection;
        if (child.depth === 1) {
          return _react2.default.createElement(
            'div',
            { key: i,
              onClick: _this.navigationItemClicked,
              className: 'small pad0x quiet space-top1' },
            sectionName
          );
        } else if (child.depth === 2) {
          return _react2.default.createElement(_navigation_item2.default, {
            key: i,
            href: '#' + child.data.id,
            onClick: _this.props.navigationItemClicked,
            active: active,
            sectionName: sectionName });
        } else if (child.depth === 3) {
          if (activeHeadings.hasOwnProperty(sectionName)) {
            return _react2.default.createElement(
              'div',
              {
                key: i,
                className: 'space-left1' },
              _react2.default.createElement(_navigation_item2.default, {
                href: '#' + child.data.id,
                onClick: _this.props.navigationItemClicked,
                active: active,
                sectionName: sectionName })
            );
          }
        }
      }),
      _custom.footerContent
    );
  }
});

module.exports = Navigation;