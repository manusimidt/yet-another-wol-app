declare module "wake_on_lan" {
  interface WakeOptions {
    address?: string;
    port?: number;
  }

  type WakeCallback = (error: Error | null) => void;

  function wake(macAddress: string, callback: WakeCallback): void;
  function wake(macAddress: string, options: WakeOptions, callback: WakeCallback): void;

  export = { wake };
}
