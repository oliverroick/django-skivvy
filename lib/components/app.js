'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _navigation = require('./navigation');

var _navigation2 = _interopRequireDefault(_navigation);

var _content = require('./content');

var _content2 = _interopRequireDefault(_content);

var _rounded_toggle = require('./rounded_toggle');

var _rounded_toggle2 = _interopRequireDefault(_rounded_toggle);

var _mixin = require('react-pure-render/mixin');

var _mixin2 = _interopRequireDefault(_mixin);

var _githubSlugger = require('github-slugger');

var _githubSlugger2 = _interopRequireDefault(_githubSlugger);

var _lodash = require('lodash.debounce');

var _lodash2 = _interopRequireDefault(_lodash);

var _custom = require('../custom');

var _querystring = require('querystring');

var _querystring2 = _interopRequireDefault(_querystring);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var slugger = new _githubSlugger2.default();
var slug = function slug(title) {
  slugger.reset();return slugger.slug(title);
};

var languageOptions = [{ title: 'cURL',
  short: 'cURL',
  value: 'curl' }, { title: 'CLI',
  short: 'cli',
  value: 'cli' }, { title: 'Python',
  short: 'Python',
  value: 'python' }, { title: 'JavaScript',
  short: 'JS',
  value: 'javascript' }, { title: 'Java',
  short: 'Java',
  value: 'java' }, { title: 'Objective-C',
  short: 'ObjC',
  value: 'objc' }, { title: 'Swift',
  short: 'Swift',
  value: 'swift' }];

var defaultLanguage = languageOptions[0];

var debouncedReplaceState = (0, _lodash2.default)(function (hash) {
  window.history.replaceState('', '', hash);
}, 100);

var App = _react2.default.createClass({
  displayName: 'App',

  mixins: [_mixin2.default],
  propTypes: {
    content: _react2.default.PropTypes.string.isRequired,
    ast: _react2.default.PropTypes.object.isRequired
  },
  getInitialState: function getInitialState() {
    var _this = this;

    var active = 'Introduction';

    if (process.browser) {
      var _ret = function () {
        var hash = window.location.hash.split('#').pop();
        // let languageFromURL = qs.parse(window.location.search.substring(1)).language;
        // console.log(languageFromURL)
        var languageFromURL = 'Python';
        var language = languageOptions.find(function (option) {
          return option.title === languageFromURL;
        }) || defaultLanguage;
        var mqls = [{ name: 'widescreen', query: window.matchMedia('(min-width: 1200px)') }, { name: 'desktop', query: window.matchMedia('(min-width: 961px)') }, { name: 'tablet', query: window.matchMedia('(max-width: 960px)') }, { name: 'mobile', query: window.matchMedia('(max-width: 640px)') }];
        mqls.forEach(function (q) {
          return q.query.addListener(_this.mediaQueryChanged);
        });
        if (hash) {
          var headingForHash = _this.props.ast.children.filter(function (child) {
            return child.type === 'heading';
          }).find(function (heading) {
            return heading.data.id === hash;
          });
          if (headingForHash) {
            active = headingForHash.children[0].value;
          }
        }
        return {
          v: {
            // media queryMatches
            mqls: mqls,
            // object of currently matched queries, like { desktop: true }
            queryMatches: {},
            language: language,
            columnMode: 2,
            activeSection: active,
            // for the toggle-able navigation on mobile
            showNav: false
          }
        };
      }();

      if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
    } else {
      return {
        mqls: {},
        queryMatches: {
          desktop: true
        },
        language: defaultLanguage,
        activeSection: '',
        showNav: false
      };
    }
  },
  toggleNav: function toggleNav() {
    this.setState({ showNav: !this.state.showNav });
  },
  componentDidMount: function componentDidMount() {
    this.mediaQueryChanged();
    this.onScroll = (0, _lodash2.default)(this.onScrollImmediate, 100);
    document.addEventListener('scroll', this.onScroll);
    this.onScrollImmediate();
  },
  onScrollImmediate: function onScrollImmediate() {
    var sections = document.querySelectorAll('div.section');
    if (!sections.length) return;
    for (var i = 0; i < sections.length; i++) {
      var rect = sections[i].getBoundingClientRect();
      if (rect.bottom > 0) {
        this.setState({
          activeSection: sections[i].getAttribute('data-title')
        });
        return;
      }
    }
  },
  mediaQueryChanged: function mediaQueryChanged() {
    this.setState({
      queryMatches: this.state.mqls.reduce(function (memo, q) {
        memo[q.name] = q.query.matches;
        return memo;
      }, {})
    });
  },
  componentWillUnmount: function componentWillUnmount() {
    var _this2 = this;

    this.state.mqls.forEach(function (q) {
      return q.removeListener(_this2.mediaQueryChanged);
    });
    document.body.removeEventListener('scroll', this.onScroll);
  },
  onChangeLanguage: function onChangeLanguage(language) {
    this.setState({ language: language }, function () {
      if (window.history) {
        window.history.pushState(null, null, '?' + _querystring2.default.stringify({ language: language.title }) + window.location.hash);
      }
    });
  },
  componentDidUpdate: function componentDidUpdate(_, prevState) {
    if (prevState.activeSection !== this.state.activeSection) {
      // when the section changes, replace the hash
      debouncedReplaceState('#' + slug(this.state.activeSection));
    } else if (prevState.language.title !== this.state.language.title || prevState.columnMode !== this.state.columnMode) {
      // when the language changes, use the hash to set scroll
      window.location.hash = window.location.hash;
    }
  },
  navigationItemClicked: function navigationItemClicked(activeSection) {
    var _this3 = this;

    setTimeout(function () {
      _this3.setState({ activeSection: activeSection });
    }, 10);
    if (!this.state.queryMatches.desktop) {
      this.toggleNav();
    }
  },
  toggleColumnMode: function toggleColumnMode() {
    this.setState({
      columnMode: this.state.columnMode === 1 ? 2 : 1
    });
  },
  render: function render() {
    var ast = JSON.parse(JSON.stringify(this.props.ast));
    var _state = this.state;
    var activeSection = _state.activeSection;
    var queryMatches = _state.queryMatches;
    var showNav = _state.showNav;
    var columnMode = _state.columnMode;

    var col1 = columnMode === 1 && queryMatches.desktop;
    return _react2.default.createElement(
      'div',
      { className: 'container unlimiter' },
      !col1 && !queryMatches.mobile && _react2.default.createElement(
        'div',
        { className: 'fixed-top fixed-right ' + (queryMatches.desktop && 'space-left16') },
        _react2.default.createElement('div', { className: 'fill-light col6 pin-right' })
      ),
      queryMatches.desktop && _react2.default.createElement(
        'div',
        { className: 'space-top5 scroll-styled overflow-auto pad1 width16 sidebar fixed-left fill-dark dark' },
        _react2.default.createElement(_navigation2.default, {
          navigationItemClicked: this.navigationItemClicked,
          activeSection: activeSection,
          ast: ast })
      ),
      _react2.default.createElement(
        'div',
        { className: '' + (queryMatches.desktop && 'space-left16') },
        _react2.default.createElement(
          'div',
          { className: col1 ? 'col8 margin1' : '' },
          _react2.default.createElement(_content2.default, {
            leftClassname: col1 ? 'space-bottom4 pad2x prose clip' : 'space-bottom8 col6 pad2x prose clip',
            rightClassname: col1 ? 'space-bottom2 pad2 prose clip fill-light space-top5' : 'space-bottom4 col6 pad2 prose clip fill-light space-top5',
            ast: ast,
            language: this.state.language })
        )
      ),
      _react2.default.createElement(
        'div',
        { className: 'fill-dark dark bottom-shadow fixed-top ' + (queryMatches.tablet ? 'pad1y pad2x col6' : 'pad0 width16') },
        _react2.default.createElement('a', { href: '/', className: 'active space-top1 space-left1 pin-topleft icon round dark pad0 ' + _custom.brandClasses }),
        _react2.default.createElement(
          'div',
          { className: 'strong small pad0\n          ' + (queryMatches.mobile ? 'space-left3' : '') + '\n          ' + (queryMatches.tablet ? 'space-left2' : 'space-left4 line-height15') },
          queryMatches.desktop ? _custom.brandNames.desktop : queryMatches.mobile ? _custom.brandNames.mobile : _custom.brandNames.tablet
        ),
        queryMatches.tablet && _react2.default.createElement(
          'div',
          null,
          _react2.default.createElement(
            'button',
            {
              onClick: this.toggleNav,
              className: 'short quiet pin-topright button rcon ' + (showNav ? 'caret-up' : 'caret-down') + ' space-right1 space-top1' },
            _react2.default.createElement(
              'span',
              { className: 'micro' },
              activeSection
            )
          ),
          showNav && _react2.default.createElement(
            'div',
            {
              className: 'fixed-left keyline-top fill-dark pin-left col6 pad2 scroll-styled space-top5' },
            _react2.default.createElement(_navigation2.default, {
              navigationItemClicked: this.navigationItemClicked,
              activeSection: activeSection,
              ast: ast })
          )
        )
      )
    );
  }
});

module.exports = App;