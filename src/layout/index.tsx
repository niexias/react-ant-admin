import React, { Component } from 'react';
import { Route, Switch, Redirect, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { Layout, BackTop, message } from "antd";
import { menuToggleAction } from "../store/actionCreators";
import menuConfig from "./menuConfig";
import avatarUrl from "../assets/images/user.jpg";
import "../style/layout.scss";
import PageHeader from "./header";
import PageSide from "./side";
import PageFooter from "./footer";
import routes from '../routes';

type PageLayoutProps = {
  history: any,
  menuClick: any,
  menuToggle: boolean
}

type PageLayoutState = {
  avatarUrl: string,
  menu: any[],
}

const { Content } = Layout;

class PageLayout extends Component<PageLayoutProps, PageLayoutState> {
  constructor(props: any) {
    super(props);
    this.state = {
      avatarUrl,
      menu: []
    };
  }

  componentDidMount() {
    this.checkLogin();
  }

  componentDidUpdate() {
    // const { pathname } = this.props.location;
  }

  checkLogin = () => {
    const loginInfo = this.getLoginInfo();
    loginInfo && loginInfo.username
      ? this.setState({ menu: this.genMenu(menuConfig) })
      : this.goToLogin();
  }

  loginOut = () => {
    localStorage.removeItem('loginInfo');
    this.goToLogin();
    message.success('退出成功');
  }

  goToLogin = () => {
    this.props.history.push('/login');
  }

  getLoginInfo = () => {
    return JSON.parse(localStorage.getItem('loginInfo') as any) || {};
  }

  genMenu = (menuConfig: any) => {
    const loginInfo = this.getLoginInfo();
    const { auth } = loginInfo;
    if (!auth) return menuConfig;
    const travel = (node: any = {}, auth: number, valid = (auth: number, node: object) => true) => {
      if (node && node.subs && node.subs.length > 0) {
        node.subs = node.subs.concat();
        node.subs = node.subs.filter((item: any) => valid(auth, item));
        node.subs.forEach((item: any) => travel(item, auth, valid));
      }
    };
    return menuConfig.filter((item: any) => {
      const { auth: authList = [] } = item;
      if (authList.includes(auth)) return false;
      item = { ...item };
      travel(item, auth, (auth: number, node: any) => Array.isArray(node.auth) ? node.auth.includes(auth) : true);
      return true;
    })
  }

  render() {
    const { menuClick, menuToggle } = this.props;
    const { auth } = this.getLoginInfo();
    const { menu, avatarUrl } = this.state;
    return (
      <Layout className="app">
        <PageSide
          menuToggle={menuToggle}
          menu={menu}
        />
        <Layout style={{ marginLeft: menuToggle ? 80 : 200, minHeight: '100vh'}}>
          <PageHeader
            menuToggle={menuToggle}
            menuClick={menuClick}
            avatar={avatarUrl}
            loginOut={this.loginOut}
          />
          <Content className="app-content">
            <Switch>
              {
                routes.map(item => {
                  const { path, exact, auth: authList } = item;
                  return (
                    <Route
                      key={path}
                      path={path}
                      exact={exact}
                      render={ props => {
                        return (!auth || (authList && authList.includes(auth)))
                          ? <item.component {...props} />
                          : <Redirect to = '/404' {...props} /> // TODO: 增加 403
                      }}>
                    </Route>
                  )
                })
              }
              <Redirect to='/404' />
            </Switch>
          </Content>
          <PageFooter />
        </Layout>
        <BackTop />
      </Layout>
    )
  }
}

const mapStateToProps = (state: any) => ({
  menuToggle: state.menuToggle
});

const mapDispatchToProps = (dispatch: any) => ({
  menuClick() {
    dispatch(menuToggleAction())
  }
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PageLayout));