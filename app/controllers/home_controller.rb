class HomeController < ApplicationController
  def index
    @socket_ip = '192.168.43.213'
  end

  def carro
    @socket_ip = '192.168.1.166'
  end
end
