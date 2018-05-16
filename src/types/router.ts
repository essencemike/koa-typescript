export interface RouteConfig {
  method: string,
  path: string,
  unless?: boolean,
}

export interface RouteMap extends RouteConfig {
  target: any;
}
