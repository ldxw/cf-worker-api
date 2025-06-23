import {Context} from "hono";
import * as local from "hono/cookie";
import * as configs from "./configs";

export async function Requests(c: Context,
                               Params: Record<string, string> | string = "",
                               APIUrl: string = "/api/login",
                               Method: string = "GET",
                               Direct: boolean = false, // true时直接回传URL
                               Header: Record<string, string> | undefined = undefined,
): Promise<any> {
    // 请求参数 ==========================================================================
    let parma_str: Record<string, string> | string = Params
    const parma_url = new URL(APIUrl);
    if (typeof Params !== "string") {
        parma_str = new URLSearchParams(Params).toString();
        Object.keys(Params).forEach(key => {
            parma_url.searchParams.append(key, Params[key]);
        });
    }
    try { // 执行请求 =====================================================================
        const default_inf = {'Content-Type': 'application/x-www-form-urlencoded'}
        const header_data: Record<string, any> = Header ? Header : default_inf
        if (Direct) return {url: Method == "GET" ? parma_url.href : APIUrl}
        const result_data: Response = await fetch(
            Method == "GET" ? parma_url.href : APIUrl, {
                method: Method,
                body: Method == "GET" ? undefined : parma_str,
                headers: Method == "GET" ? undefined : header_data
            }
        );
        return await result_data.json()
    } catch (error) {
        return {text: error}
    }
}

export function setCookie(c: Context, client_info: configs.Clients) {
    local.setCookie(c, 'driver_txt', client_info.drivers ? client_info.drivers : "");
    local.setCookie(c, 'server_use', client_info.servers ? client_info.servers.toString() : "");
    if (!client_info.servers) {
        local.setCookie(c, 'client_uid', client_info.app_uid ? client_info.app_uid : "");
        local.setCookie(c, 'client_key', client_info.app_key ? client_info.app_key : "");
    }
}

export function getCookie(c: Context): configs.Clients {
    return {
        app_uid: local.getCookie(c, 'client_uid'),
        app_key: local.getCookie(c, 'client_key'),
        secrets: local.getCookie(c, 'secret_key'),
        drivers: local.getCookie(c, 'driver_txt'),
        servers: local.getCookie(c, 'server_use') == "true",
    };
}